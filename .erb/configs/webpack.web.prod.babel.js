/**
 * Build config for electron renderer process
 */
 import path from 'path';
 import webpack from 'webpack';
 import MiniCssExtractPlugin from 'mini-css-extract-plugin';
 import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
 import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
 import { merge } from 'webpack-merge';
 import TerserPlugin from 'terser-webpack-plugin';
 import baseConfig from './webpack.config.base';
 const devtoolsConfig = process.env.DEBUG_PROD === 'true' ? {
   devtool: 'source-map'
 } : {};
 export default merge(baseConfig, {
   ...devtoolsConfig,
   mode: 'production',
   target: 'web',
   entry: [
     'core-js',
     'regenerator-runtime/runtime',
     path.join(__dirname, '../../src/indexWeb.tsx'),
   ],
   output: {
     path: path.join(__dirname, '../../src/web-dist'),
     publicPath: './dist/',
     filename: 'indexWeb.prod.js',
   },
   module: {
     rules: [
       {
         test: /.s?css$/,
         use: [
           {
             loader: MiniCssExtractPlugin.loader,
             options: {
               // `./dist` can't be inerhited for publicPath for styles. Otherwise generated paths will be ./dist/dist
               publicPath: './',
             },
           },
           'css-loader',
           'sass-loader'
         ],
       },
       // WOFF Font
       {
         test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
         use: {
           loader: 'url-loader',
           options: {
             limit: 10000,
             mimetype: 'application/font-woff',
           },
         },
       },
       // WOFF2 Font
       {
         test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
         use: {
           loader: 'url-loader',
           options: {
             limit: 10000,
             mimetype: 'application/font-woff',
           },
         },
       },
       // OTF Font
       {
         test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
         use: {
           loader: 'url-loader',
           options: {
             limit: 10000,
             mimetype: 'font/otf',
           },
         },
       },
       // TTF Font
       {
         test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
         use: {
           loader: 'url-loader',
           options: {
             limit: 10000,
             mimetype: 'application/octet-stream',
           },
         },
       },
       // EOT Font
       {
         test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
         use: 'file-loader',
       },
       // SVG Font
       {
         test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
         use: {
           loader: 'url-loader',
           options: {
             limit: 10000,
             mimetype: 'image/svg+xml',
           },
         },
       },
       // Common Image Formats
       {
         test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
         use: 'url-loader',
       },
     ],
   },
   optimization: {
     minimize: false,
     minimizer:
       [
         new TerserPlugin({
           parallel: true,
         }),
         new CssMinimizerPlugin(),
       ],
   },
   plugins: [
     /**
      * Create global constants which can be configured at compile time.
      *
      * Useful for allowing different behaviour between development builds and
      * release builds
      *
      * NODE_ENV should be production so that modules do not perform certain
      * development checks
      */
     new webpack.EnvironmentPlugin({
       NODE_ENV: 'production',
       DEBUG_PROD: false,
     }),
     new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
     }),
     new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
     }),
     new MiniCssExtractPlugin({
       filename: 'style.css',
     }),
     new BundleAnalyzerPlugin({
       analyzerMode:
         process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
       openAnalyzer: process.env.OPEN_ANALYZER === 'true',
     }),
   ],
      resolve: {
         alias: {
           'react-dom': 'react-dom/profiling',
           'scheduler/tracing': 'scheduler/tracing-profiling',
 //          'schedule/tracking': 'schedule/cjs/schedule-tracking.profiling.min'
           'stream': 'stream-browserify',
         },
         fallback: {
          "http": false,
          "https": false,
          "tty": false,
          "zlib": false,
          "fs": false,
          "crypto": false,
          "path": false,
          "os": false,
          "constants": false,
          "net": false,
          "tls": false,
          "child_process": false,
          "buffer": require.resolve("buffer"),
        }
       }
 });