///
/// JSensorAvailability.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include "SensorAvailability.hpp"

#include "BiometryType.hpp"
#include "JBiometryType.hpp"

namespace margelo::nitro::biolink::native {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "SensorAvailability" and the the Kotlin data class "SensorAvailability".
   */
  struct JSensorAvailability final: public jni::JavaClass<JSensorAvailability> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/biolink/native/SensorAvailability;";

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct SensorAvailability by copying all values to C++.
     */
    [[maybe_unused]]
    [[nodiscard]]
    SensorAvailability toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldAvailable = clazz->getField<jboolean>("available");
      jboolean available = this->getFieldValue(fieldAvailable);
      static const auto fieldBiometryType = clazz->getField<JBiometryType>("biometryType");
      jni::local_ref<JBiometryType> biometryType = this->getFieldValue(fieldBiometryType);
      return SensorAvailability(
        static_cast<bool>(available),
        biometryType->toCpp()
      );
    }

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    [[maybe_unused]]
    static jni::local_ref<JSensorAvailability::javaobject> fromCpp(const SensorAvailability& value) {
      return newInstance(
        value.available,
        JBiometryType::fromCpp(value.biometryType)
      );
    }
  };

} // namespace margelo::nitro::biolink::native
