const rules = require('./webpack.rules.js'); // eslint-disable-line
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'); // eslint-disable-line
const { WebpackConfigDumpPlugin } = require("webpack-config-dump-plugin"); // eslint-disable-line

module.exports = {
  module: { rules },
  output: { 
    chunkFilename:'ui/[name].chunk.js' 
  },
  devtool: 'source-map',
  devServer: {
    hot: false,
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    // new WebpackConfigDumpPlugin({ depth: 10 })
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
  },
};
