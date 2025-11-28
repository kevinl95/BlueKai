const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Load environment variables if .env.local exists
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv is optional
}

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: './'
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
            ],
            cacheDirectory: true
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BLUESKY_API_URL': JSON.stringify(process.env.BLUESKY_API_URL || 'https://bsky.social')
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.webapp', to: 'manifest.webapp' },
        { from: 'icons', to: 'icons', noErrorOnMissing: true },
        { from: 'public/i18n', to: 'i18n' }, // Removed noErrorOnMissing - should fail if missing
        { from: 'public/.nojekyll', to: '.nojekyll', toType: 'file', noErrorOnMissing: true },
        { from: 'bluekai-logo.png', to: 'bluekai-logo.png', noErrorOnMissing: true }
      ]
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 1024,
      minRatio: 0.8
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          parse: {
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: false,
            drop_debugger: true,
            pure_funcs: []
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        extractComments: false
      })
    ],
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 3,
      maxAsyncRequests: 3,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    },
    runtimeChunk: false
  },
  performance: {
    maxAssetSize: 256000, // 250KB - adjusted for full-featured KaiOS app
    maxEntrypointSize: 256000,
    hints: 'warning' // Changed to warning instead of error
  },
  devtool: false
};
