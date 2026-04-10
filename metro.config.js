const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add 'cjs' to source extensions to support internal Firebase v9+ modules
defaultConfig.resolver.sourceExts.push('cjs');

// Disable package exports to fully suppress getAuth resolution issues
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
