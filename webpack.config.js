const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
      new HtmlWebpackPlugin({
      title: 'Genetic algorithms',
      template: 'src/assets/index.html'
    }),
    new webpack.ProvidePlugin({
      THREE: 'three'
    })
  ],
  module: {
    rules: [
      {
        test:  /\.js$/,
        "exclude": "/node_modules/",
        use: {
          "loader": "babel-loader",
          "options": {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
            "style-loader",
            "css-loader",
            "sass-loader"
        ]
     },
     {
      test: /\.css$/,
      use: [
          "style-loader",
          "css-loader",
      ]
     },
     {
      test: /\.glsl$/,
      use: [
          "webpack-glsl-loader",
      ]
    }
    ]
  }
};