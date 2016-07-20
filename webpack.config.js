const webpack = require('webpack');

module.exports = {
  output: {
    path: `${__dirname}/build/`,
    filename: 'bundle.js'
  },
  entry: './index.js',
  resolve: {
    extensions: ['', '.js'],

    modulesDirectories: [
      'node_modules',
      'src'
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['syntax-object-rest-spread', 'transform-object-rest-spread']
        }
      }
    ]
  }
};
