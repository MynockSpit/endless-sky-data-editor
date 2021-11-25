const relocateLoader = require('@vercel/webpack-asset-relocator-loader'); // eslint-disable-line

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    // this is needed b/c reasons:
    // https://github.com/vercel/webpack-asset-relocator-loader/issues/141
    {
      apply(compiler) {
        compiler.hooks.compilation.tap(
          'webpack-asset-relocator-loader',
          (compilation) => { relocateLoader.initAssetCache(compilation, '') },
        );
      },
    },
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
  mode: 'development',
};