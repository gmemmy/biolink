import Foundation
import LocalAuthentication
import NitroModules
import Security
import os.log

public class HybridBiolinkCore: HybridBiolinkCoreSpec {
    public var memorySize: Int {
        return MemoryHelper.getSizeOf(self)
    }
    
    public override init() {
      super.init()
    }
    
    public func authenticate(fallbackToDeviceCredential: Bool?) throws -> Promise<Bool> {
        let fallback = fallbackToDeviceCredential ?? false
        os_log(.debug, log: .default, "BiolinkCore: authenticate() called with fallbackToDeviceCredential: %@", fallback ? "true" : "false")
        
        return Promise<Bool>.async {
            let context = LAContext()
            var error: NSError?
            
            // Choose policy based on fallbackToDeviceCredential parameter
            let policy: LAPolicy = fallback ? .deviceOwnerAuthentication : .deviceOwnerAuthenticationWithBiometrics
            
            guard context.canEvaluatePolicy(policy, error: &error) else {
                let policyName = fallback ? "deviceOwnerAuthentication" : "deviceOwnerAuthenticationWithBiometrics"
                os_log(.error, log: .default, "BiolinkCore: Authentication policy %@ not available - %@", policyName, error?.localizedDescription ?? "Unknown error")
                throw NSError(domain: "BiolinkCore", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Authentication is not available"])
            }
            
            return try await withCheckedThrowingContinuation { continuation in
                let start = CFAbsoluteTimeGetCurrent()
                let reason = fallback ? "Authenticate with biometrics or device passcode to access your account" : "Authenticate with biometrics to access your account"
                
                context.evaluatePolicy(policy, localizedReason: reason) { success, authError in
                    let duration = (CFAbsoluteTimeGetCurrent() - start) * 1000
                    
                    if success {
                        os_log(.info, log: .default, "BiolinkCore: Authentication successful - native took %.2f ms", duration)
                        continuation.resume(returning: true)
                    } else {
                        os_log(.error, log: .default, "BiolinkCore: Authentication failed - native took %.2f ms - %@", duration, authError?.localizedDescription ?? "Unknown error")
                        let error = authError ?? NSError(domain: "BiolinkCore", code: 1002, userInfo: [NSLocalizedDescriptionKey: "Authentication failed"])
                        continuation.resume(throwing: error)
                    }
                }
            }
        }
    }
    
    public func storeSecret(key: String, value: String) throws -> Promise<Void> {
        os_log(.debug, log: .default, "BiolinkCore: storeSecret() called with key: %@", key)
        
        return Promise<Void>.async {
            let bundleID = Bundle.main.bundleIdentifier ?? "com.biolink.default"
            let keychainQuery: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: bundleID,
                kSecAttrAccount as String: key,
                kSecValueData as String: value.data(using: .utf8)!,
                kSecAttrAccessible as String: kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
            ]
            
            // Delete any existing item first
            SecItemDelete(keychainQuery as CFDictionary)
            
            // Add the new item
            let status = SecItemAdd(keychainQuery as CFDictionary, nil)
            
            if status == errSecSuccess {
                os_log(.info, log: .default, "BiolinkCore: Secret stored successfully for key: %@", key)
                return
            } else {
                os_log(.error, log: .default, "BiolinkCore: Failed to store secret for key: %@ with status: %d", key, status)
                throw NSError(domain: "BiolinkCore", code: 1003, userInfo: [NSLocalizedDescriptionKey: "Failed to store secret in keychain"])
            }
        }
    }
    
    public func getSecret(key: String) throws -> Promise<String?> {
        os_log(.debug, log: .default, "BiolinkCore: getSecret() called with key: %@", key)
        
        return Promise<String?>.async {
            let bundleID = Bundle.main.bundleIdentifier ?? "com.biolink.default"
            let keychainQuery: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: bundleID,
                kSecAttrAccount as String: key,
                kSecReturnData as String: true,
                kSecMatchLimit as String: kSecMatchLimitOne
            ]
            
            var dataTypeRef: AnyObject?
            let status = SecItemCopyMatching(keychainQuery as CFDictionary, &dataTypeRef)
            
            if status == errSecSuccess {
                if let data = dataTypeRef as? Data,
                   let secretString = String(data: data, encoding: .utf8) {
                    os_log(.info, log: .default, "BiolinkCore: Secret retrieved successfully for key: %@", key)
                    return secretString
                } else {
                    os_log(.error, log: .default, "BiolinkCore: Failed to decode secret data for key: %@", key)
                    return nil
                }
            } else if status == errSecItemNotFound {
                os_log(.info, log: .default, "BiolinkCore: No secret found for key: %@", key)
                return nil
            } else {
                os_log(.error, log: .default, "BiolinkCore: Failed to retrieve secret for key: %@ with status: %d", key, status)
                throw NSError(domain: "BiolinkCore", code: 1004, userInfo: [NSLocalizedDescriptionKey: "Failed to retrieve secret from keychain"])
            }
        }
    }
}
