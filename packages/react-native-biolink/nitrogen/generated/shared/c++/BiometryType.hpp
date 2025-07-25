///
/// BiometryType.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#if __has_include(<NitroModules/NitroHash.hpp>)
#include <NitroModules/NitroHash.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif
#if __has_include(<NitroModules/JSIConverter.hpp>)
#include <NitroModules/JSIConverter.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif
#if __has_include(<NitroModules/NitroDefines.hpp>)
#include <NitroModules/NitroDefines.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif

namespace margelo::nitro::biolink::native {

  /**
   * An enum which can be represented as a JavaScript union (BiometryType).
   */
  enum class BiometryType {
    TOUCHID      SWIFT_NAME(touchid) = 0,
    FACEID      SWIFT_NAME(faceid) = 1,
    BIOMETRICS      SWIFT_NAME(biometrics) = 2,
    NONE      SWIFT_NAME(none) = 3,
  } CLOSED_ENUM;

} // namespace margelo::nitro::biolink::native

namespace margelo::nitro {

  using namespace margelo::nitro::biolink::native;

  // C++ BiometryType <> JS BiometryType (union)
  template <>
  struct JSIConverter<BiometryType> final {
    static inline BiometryType fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      std::string unionValue = JSIConverter<std::string>::fromJSI(runtime, arg);
      switch (hashString(unionValue.c_str(), unionValue.size())) {
        case hashString("TouchID"): return BiometryType::TOUCHID;
        case hashString("FaceID"): return BiometryType::FACEID;
        case hashString("Biometrics"): return BiometryType::BIOMETRICS;
        case hashString("None"): return BiometryType::NONE;
        default: [[unlikely]]
          throw std::invalid_argument("Cannot convert \"" + unionValue + "\" to enum BiometryType - invalid value!");
      }
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, BiometryType arg) {
      switch (arg) {
        case BiometryType::TOUCHID: return JSIConverter<std::string>::toJSI(runtime, "TouchID");
        case BiometryType::FACEID: return JSIConverter<std::string>::toJSI(runtime, "FaceID");
        case BiometryType::BIOMETRICS: return JSIConverter<std::string>::toJSI(runtime, "Biometrics");
        case BiometryType::NONE: return JSIConverter<std::string>::toJSI(runtime, "None");
        default: [[unlikely]]
          throw std::invalid_argument("Cannot convert BiometryType to JS - invalid value: "
                                    + std::to_string(static_cast<int>(arg)) + "!");
      }
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isString()) {
        return false;
      }
      std::string unionValue = JSIConverter<std::string>::fromJSI(runtime, value);
      switch (hashString(unionValue.c_str(), unionValue.size())) {
        case hashString("TouchID"):
        case hashString("FaceID"):
        case hashString("Biometrics"):
        case hashString("None"):
          return true;
        default:
          return false;
      }
    }
  };

} // namespace margelo::nitro
