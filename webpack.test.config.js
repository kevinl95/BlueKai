const path = require('path');

module.exports = {
  entry: './src/test-exports.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: false
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  firefox: '48'
                },
                useBuiltIns: 'usage',
                corejs: 3,
                modules: false
              }],
              ['@babel/preset-react', {
                pragma: 'h',
                pragmaFrag: 'Fragment'
              }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  mode: 'development',
  devtool: 'eval-source-map'
};
