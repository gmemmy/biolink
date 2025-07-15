cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE ON)

# Set the project name
project(BiolinkCore)

# Create the library - the implementation files are added by the autolinking
add_library(BiolinkCore SHARED)

# Set C++ standard
set_target_properties(BiolinkCore PROPERTIES
  CXX_STANDARD 20
  CXX_STANDARD_REQUIRED ON
  POSITION_INDEPENDENT_CODE ON
)

# Include the autolinking configuration
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/BiolinkCore+autolinking.cmake) 