const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const webpack = require('webpack');
const OptimizeJsPlugin = require("optimize-js-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ThreadsPlugin = require('threads-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const targets = {
   'client': {
      entry: 'src/client/client.main.ts',
      distDir: "dist-client",
      output: 'main.js',
      target: "web",
      title: "Game Off 2020",
      assetDir: "asset",
      distAssetDir: "asset",
      baseUrl: "."
   },
   'server': {
      entry: 'src/server/server.main.ts',
      distDir: "dist-server",
      output: 'main.js',
      target: "node"
   }
};

module.exports = (env, argv) => {
   function isProd() {
      return argv.mode === 'production';
   }

   const targetName = argv.projectTarget || Object.keys(targets)[0];
   const target = targets[targetName];
   console.log("Target:", targetName, target);
   console.log("Entry: ", path.resolve(__dirname, target.entry));
   console.log("Output path: ", path.resolve(__dirname, target.distDir));

   /*
    * Plugins
    */
   const plugins = [
      new MiniCssExtractPlugin({
         filename: '[name].bundle.css',
         chunkFilename: "[id].css"
      }),
   ];
   if(isProd() && (targetName === 'client' || targetName === 'server')) {
      plugins.push(new CleanWebpackPlugin({
         cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, target.distDir + '/**/*')],
      }));
   }
   if(targetName === 'client') {
      // plugins.push(new ThreadsPlugin()); // TODO: Enable when using workers for the network
      if(isProd()) {
         plugins.push(
            new ReplaceInFileWebpackPlugin([{
               dir: target.distDir,
               files: [target.output],
               rules: [
                  {
                     search: '.worker.js',
                     replace: '.worker.js?' + Date.now()
                  }
               ]
            }]),
            new ReplaceInFileWebpackPlugin([{
               dir: target.distDir,
               files: ['index.html'],
               rules: [
                  {
                     search: target.output,
                     replace: `${target.output}?${Date.now()}`
                  },
                  {
                     search: `<meta name="base" content="${target.baseUrl}">`,
                     replace: `<meta name="base" content="${target.baseUrl}">\n<meta http-equiv="cache-control" content="no-cache" />`
                  },
               ]
            }]),
            new CopyWebpackPlugin([{from: target.assetDir, to: target.distAssetDir}]),
         );
      }
      plugins.push(
         new HtmlWebPackPlugin({
            filename: "index.html",
            title: target.title,
            meta: {
               base: '/',
               viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
               'theme-color': '#000000'
            }
         }),
      );
   }
   if(!isProd()) {
      plugins.push(new webpack.HotModuleReplacementPlugin());
   }

   /*
    * Minimizers
    */
   const minimizers = [
      new OptimizeJsPlugin({
         sourceMap: !isProd()
      }),
      new OptimizeCssAssetsPlugin({
         cssProcessorPluginOptions: {
            preset: ['default', {discardComments: {removeAll: true}}],
         },
      })
   ];

   if(target.target === "web") {
      minimizers.push(new TerserPlugin({
         parallel: false,
         terserOptions: {
            ecma: 6,
            keep_classnames: false,
            keep_fnames: false,
            // compress: {
            //     drop_console: true,
            // }
         },
      }));
   }


   return {
      entry: path.resolve(__dirname, target.entry),
      watch: !isProd(),
      output: {
         path: path.resolve(__dirname, target.distDir),
         filename: target.output,
         pathinfo: false
      },
      target: target.target,
//      externals: target.target === "node" ? [
//         nodeExternals({
//            whitelist: [/^three/, /^shared/]
//         })
//      ] : [],
      devServer: {
         port: 8081
      },
      resolve: {
         extensions: [
            '.tsx',
            ...(() => isProd() ? ['.prod.ts'] : [])(), // This will override prod config
            '.ts',
            '.js'
         ]
      },
      devtool: !isProd() ? 'inline-source-map' : '',
      module: {
         rules: [
            {
               test: /\.css$/,
               use: [
                  'style-loader',
                  'css-loader'
               ]
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
               test: /\.tsx?$/,
               use: [
                  {
                     loader: 'babel-loader'
                  },
                  {
                     loader: 'ts-loader',
                     options: {
                        transpileOnly: true, // Disabled due to performance reasons
                        experimentalWatchApi: !isProd(),
                        compilerOptions: {
                           module: "esnext"
                        }
                     },
                  },
               ],
            },
            {
               test: /\.html$/,
               use: [
                  {
                     loader: "html-loader",
                     options: {
                        minimize: true
                     }
                  }
               ]
            },
            {
               test: /\.(png|jpg|jpeg|gif|svg|bin|glb|gltf|woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
               use: [
                  {
                     loader: 'file-loader',
                     options: {
                        name: '[path]/[name].[ext]',
                        outputPath: (url, resourcePath, context) => {
                           if(isProd()) {
                              return path.relative(context, resourcePath).replace(path.normalize("src/"), "");
                           } else {
                              return url;
                           }
                        },
                     },
                  },
               ],
            },
            {
               test: /\.(gltf)$/,
               use: [
                  {
                     loader: "gltf-webpack-loader"
                  }
               ]
            },
         ]
      },
      optimization: {
         minimize: isProd(),
         minimizer: minimizers
      },
      plugins: plugins
   };
};
