const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude expo-updates completely
config.resolver.blacklistRE = /expo-updates/;

// Ensure no update-related modules are resolved
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes('expo-updates')) {
    return {
      type: 'empty',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
