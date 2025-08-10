module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-worklets/plugin",
      // Reanimated plugin MUST be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
