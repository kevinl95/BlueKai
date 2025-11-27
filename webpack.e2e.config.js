const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/e2e-test-exports.js',
  output: {
    filename: 'e2e-test-exports.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['Firefox 48']
                },
                useBuiltIns: false,
                modules: false
              }]
            ],
            plugins: [
              ['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  devtool: 'source-map'
};
