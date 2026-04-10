module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '~/apis': './src/apis',
            '~/assets': './src/assets',
            '~/components': './src/components',
            '~/config': './src/config',
            '~/constants': './src/constants',
            '~/data': './src/data',
            '~/hooks': './src/hooks',
            '~/navigators': './src/navigators',
            '~/redux': './src/redux',
            '~/screens': './src/screens',
            '~/services': './src/services',
            '~/styles': './src/styles',
            '~/translations': './src/translations',
            '~/utils': './src/utils',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      // PHẢI thêm dòng này vào cuối cùng của mảng plugins
      'react-native-reanimated/plugin',
    ],
  };
};