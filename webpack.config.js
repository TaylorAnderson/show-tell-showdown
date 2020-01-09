const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = {
  entry: './src/App.ts',
  devtool: 'inline-source-map',
  mode: 'development',

  devServer: {
    contentBase: './dist',
    hot: true,
    port: 3000,
    disableHostCheck: true
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Development',
      inject: 'body',
    }),
    new CopyWebpackPlugin([{ from: './src/assets', to: 'assets' }]),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: 'file-loader'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        /*configFile: "./path/to/tsconfig.json" */
      })
    ],
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }
};
