///
/// BiolinkCoreOnLoad.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#ifndef BUILDING_BIOLINKCORE_WITH_GENERATED_CMAKE_PROJECT
#error BiolinkCoreOnLoad.cpp is not being built with the autogenerated CMakeLists.txt project. Is a different CMakeLists.txt building this?
#endif

#include "BiolinkCoreOnLoad.hpp"

#include <jni.h>
#include <fbjni/fbjni.h>
#include <NitroModules/HybridObjectRegistry.hpp>

#include "JHybridBiolinkCoreSpec.hpp"
#include <NitroModules/JNISharedPtr.hpp>
#include <NitroModules/DefaultConstructableObject.hpp>

namespace margelo::nitro::biolink::native {

int initialize(JavaVM* vm) {
  using namespace margelo::nitro;
  using namespace margelo::nitro::biolink::native;
  using namespace facebook;

  return facebook::jni::initialize(vm, [] {
    // Register native JNI methods
    margelo::nitro::biolink::native::JHybridBiolinkCoreSpec::registerNatives();

    // Register Nitro Hybrid Objects
    HybridObjectRegistry::registerHybridObjectConstructor(
      "BiolinkCore",
      []() -> std::shared_ptr<HybridObject> {
        static DefaultConstructableObject<JHybridBiolinkCoreSpec::javaobject> object("com/margelo/nitro/biolink/native/HybridBiolinkCore");
        auto instance = object.create();
        auto globalRef = jni::make_global(instance);
        return JNISharedPtr::make_shared_from_jni<JHybridBiolinkCoreSpec>(globalRef);
      }
    );
  });
}

} // namespace margelo::nitro::biolink::native
