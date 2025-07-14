import Foundation
import LocalAuthentication
import NitroModules
import os.log

public class HybridBiolinkCore: HybridBiolinkCoreSpec {
    public var hybridContext = margelo.nitro.HybridContext()
    
    public var memorySize: Int {
        return getSizeOf(self)
    }
    
    public init() {
      
    }
    
    public func authenticate() throws -> Promise<Bool> {
        os_log(.debug, log: .default, "BiolinkCore: authenticate() called")
        
        return Promise.create { resolve, reject in
            let context = LAContext()
            var error: NSError?
            
            guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
                os_log(.error, log: .default, "BiolinkCore: Biometric authentication not available - %@", error?.localizedDescription ?? "Unknown error")
                DispatchQueue.main.async {
                    reject("NO_BIOMETRICS", error?.localizedDescription ?? "Biometric authentication is not available")
                }
                return
            }
            
            os_log(.debug, log: .default, "BiolinkCore: Starting biometric evaluation")
            
            context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "Authenticate to continue"
            ) { success, authError in
                DispatchQueue.main.async {
                    if success {
                        os_log(.info, log: .default, "BiolinkCore: Biometric authentication successful")
                        resolve(true)
                    } else {
                        let errorCode = (authError as? LAError)?.code.rawValue ?? -1
                        let errorMessage = authError?.localizedDescription ?? "Authentication failed"
                        os_log(.error, log: .default, "BiolinkCore: Authentication failed with code %d: %@", errorCode, errorMessage)
                        reject("AUTH_FAILED_\(errorCode)", errorMessage)
                    }
                }
            }
        }
    }
    
    public func storeSecret(key: String, value: String) throws -> Promise<Void> {
        os_log(.debug, log: .default, "BiolinkCore: storeSecret() called for key: %@", key)
        
        return Promise.create { resolve, reject in
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrAccount as String: key,
                kSecAttrService as String: "BiolinkCore",
                kSecValueData as String: value.data(using: .utf8)!,
                kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
            ]
            
            // Delete existing item first
            SecItemDelete(query as CFDictionary)
            
            let status = SecItemAdd(query as CFDictionary, nil)
            
            if status == errSecSuccess {
                os_log(.info, log: .default, "BiolinkCore: Secret stored successfully for key: %@", key)
                resolve(())
            } else {
                let errorMessage = SecCopyErrorMessageString(status, nil) as String? ?? "Unknown keychain error"
                os_log(.error, log: .default, "BiolinkCore: Failed to store secret for key %@: %@", key, errorMessage)
                reject("KEYCHAIN_ERROR", errorMessage)
            }
        }
    }
    
    public func getSecret(key: String) throws -> Promise<String?> {
        os_log(.debug, log: .default, "BiolinkCore: getSecret() called for key: %@", key)
        
        return Promise.create { resolve, reject in
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrAccount as String: key,
                kSecAttrService as String: "BiolinkCore",
                kSecReturnData as String: true,
                kSecMatchLimit as String: kSecMatchLimitOne
            ]
            
            var result: AnyObject?
            let status = SecItemCopyMatching(query as CFDictionary, &result)
            
            if status == errSecSuccess {
                if let data = result as? Data,
                   let string = String(data: data, encoding: .utf8) {
                    os_log(.info, log: .default, "BiolinkCore: Secret retrieved successfully for key: %@", key)
                    resolve(string)
                } else {
                    os_log(.error, log: .default, "BiolinkCore: Failed to decode secret data for key: %@", key)
                    reject("DECODE_ERROR", "Failed to decode secret data")
                }
            } else if status == errSecItemNotFound {
                os_log(.debug, log: .default, "BiolinkCore: No secret found for key: %@", key)
                resolve(nil)
            } else {
                let errorMessage = SecCopyErrorMessageString(status, nil) as String? ?? "Unknown keychain error"
                os_log(.error, log: .default, "BiolinkCore: Failed to retrieve secret for key %@: %@", key, errorMessage)
                reject("KEYCHAIN_ERROR", errorMessage)
            }
        }
    }
}
