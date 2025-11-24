const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      filename: isProduction ? 'bundle.[contenthash:8].js' : 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
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
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        } : false
      }),
      ...(env.analyze ? [new BundleAnalyzerPlugin()] : [])
    ],
    optimization: {
      usedExports: true,
      minimize: isProduction
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'dist')
        },
        {
          directory: path.join(__dirname),
          publicPath: '/',
          serveIndex: false,
          watch: false
        }
      ],
      compress: true,
      port: 8080,
      hot: true,
      open: false,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    devtool: isProduction ? false : 'eval-source-map',
    performance: {
      maxAssetSize: 204800,
      maxEntrypointSize: 204800,
      hints: isProduction ? 'warning' : false
    }
  };
};
