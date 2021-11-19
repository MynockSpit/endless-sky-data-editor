const rules = require('./webpack.rules.js'); // eslint-disable-line
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'); // eslint-disable-line

module.exports = {
  module: { rules },
  devtool: 'source-map',
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
};
