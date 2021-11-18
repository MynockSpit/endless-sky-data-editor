const rules = require('./webpack.rules.js'); // eslint-disable-line
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'); // eslint-disable-line

module.exports = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      }
    ],
  },
  target: ['web', 'electron-renderer'],
  devtool: "hidden-cheap-module-source-map",
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};
