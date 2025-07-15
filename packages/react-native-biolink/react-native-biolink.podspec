require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |spec|
  spec.name          = "react-native-biolink"
  spec.module_name   = "BiolinkCore"
  spec.version       = package["version"]
  spec.summary       = package["description"]
  spec.description   = package["description"]
  spec.homepage      = package["homepage"]
  spec.license       = package["license"]
  spec.authors       = package["author"]

  spec.platforms    = {
    :ios => "12.0"
  }
  
  spec.source        = { :git => "https://github.com/biolink/react-native-biolink.git", :tag => "#{spec.version}" }
  
  spec.source_files  = "ios/**/*.{h,m,mm,swift}"
  spec.swift_version = "5.9"
  
  load 'nitrogen/generated/ios/BiolinkCore+autolinking.rb'
  add_nitrogen_files(spec)
  
  # Override build settings to use stable C++ interop
  current_pod_target_xcconfig = spec.attributes_hash['pod_target_xcconfig'] || {}
  spec.pod_target_xcconfig = current_pod_target_xcconfig.merge({
    "SWIFT_OBJC_INTEROP_MODE" => "objcxx",
    "OTHER_SWIFT_FLAGS" => "$(inherited) -cxx-interoperability-mode=default"
  })
end 