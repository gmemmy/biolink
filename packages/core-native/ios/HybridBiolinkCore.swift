import Foundation
import LocalAuthentication
import NitroModules

public class HybridBiolinkCore: HybridBiolinkCoreSpec {
    public var hybridContext = margelo.nitro.HybridContext()
    
    public var memorySize: Int {
        return getSizeOf(self)
    }
    
    public init() {
      
    }
    
    public func authenticate() throws -> Promise<Bool> {
        return Promise.create { resolve, reject in
            let context = LAContext()
            var error: NSError?
            
            guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
                DispatchQueue.main.async {
                    reject("NO_BIOMETRICS", error?.localizedDescription ?? "Biometric authentication is not available")
                }
                return
            }
            
            context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "Authenticate to continue"
            ) { success, authError in
                DispatchQueue.main.async {
                    if success {
                        resolve(true)
                    } else {
                        let errorCode = (authError as? LAError)?.code.rawValue ?? -1
                        let errorMessage = authError?.localizedDescription ?? "Authentication failed"
                        reject("AUTH_FAILED_\(errorCode)", errorMessage)
                    }
                }
            }
        }
    }
    
    public func storeSecret(key: String, value: String) throws -> Promise<Void> {
        return Promise.create { resolve, reject in
            DispatchQueue.global(qos: .userInitiated).async {
                let query: [String: Any] = [
                    kSecClass as String: kSecClassGenericPassword,
                    kSecAttrAccount as String: key,
                    kSecValueData as String: value.data(using: .utf8)!,
                    kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
                ]
                
                SecItemDelete(query as CFDictionary)
                
                let status = SecItemAdd(query as CFDictionary, nil)
                
                DispatchQueue.main.async {
                    if status == errSecSuccess {
                        resolve(())
                    } else {
                        reject("KEYCHAIN_ERROR", "Failed to store secret: \(status)")
                    }
                }
            }
        }
    }
    
    public func getSecret(key: String) throws -> Promise<String?> {
        return Promise.create { resolve, reject in
            DispatchQueue.global(qos: .userInitiated).async {
                let query: [String: Any] = [
                    kSecClass as String: kSecClassGenericPassword,
                    kSecAttrAccount as String: key,
                    kSecReturnData as String: true,
                    kSecMatchLimit as String: kSecMatchLimitOne
                ]
                
                var result: AnyObject?
                let status = SecItemCopyMatching(query as CFDictionary, &result)
                
                DispatchQueue.main.async {
                    if status == errSecSuccess,
                       let data = result as? Data,
                       let value = String(data: data, encoding: .utf8) {
                        resolve(value)
                    } else if status == errSecItemNotFound {
                        resolve(nil)
                    } else {
                        reject("KEYCHAIN_ERROR", "Failed to retrieve secret: \(status)")
                    }
                }
            }
        }
    }
}
