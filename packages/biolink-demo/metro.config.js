const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('node:path');

/**
 * Metro configuration for workspace setup
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Watch the workspace root for changes
    path.resolve(__dirname, '../../'),
  ],
  resolver: {
    // Tell Metro to look for node_modules in the workspace root
    nodeModulesPaths: [
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  // Clear Metro cache on startup to avoid stale cache issues
  resetCache: true,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
