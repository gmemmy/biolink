#include <jni.h>
#include "BiolinkCoreOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
    return margelo::nitro::biolink::initialize(vm);
} 