import * as path from 'path';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { Configuration, HotModuleReplacementPlugin } from 'webpack';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import OptimizeJsPlugin from 'optimize-js-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ReplaceInFileWebpackPlugin from 'replace-in-file-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ThreadsPlugin from 'threads-plugin';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import nodeExternals from 'webpack-node-externals';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import HtmlWebpackPartialsPlugin from 'html-webpack-partials-plugin';

interface Target {
   readonly entry: string;
   readonly distDir: string;
   readonly output: string;
   readonly target: 'web' | 'node';
   readonly title?: string;
   readonly assetDir?: string;
   readonly distAssetDir?: string;
   readonly baseUrl?: string;
}

const targets: { client: Target; server: Target } = {
   client: {
      entry: 'src/main/client/client.main.ts',
      distDir: 'dist/client',
      output: 'main.js',
      target: 'web',
      title: 'The Big Cheese - Game Off 2020',
      assetDir: 'src/asset',
      distAssetDir: 'asset',
      baseUrl: '.',
   },
   server: {
      entry: 'src/main/server/server.main.ts',
      distDir: 'dist/server',
      output: 'main.js',
      target: 'node',
   },
};

module.exports = (env: string, argv: { [key: string]: string }): Configuration => {
   function isProd(): boolean {
      return argv.mode === 'production';
   }

   const targetName = (argv.projectTarget || Object.keys(targets)[0]) as 'client' | 'server';
   const target = targets[targetName];
   console.log('Target:', targetName, target);
   console.log('Entry: ', path.resolve(__dirname, target.entry));
   console.log('Output path: ', path.resolve(__dirname, target.distDir));

   /*
    * Plugins
    */
   const plugins = [
      new MiniCssExtractPlugin({
         filename: '[name].bundle.css',
         chunkFilename: '[id].css',
      }),
   ];
   if (isProd() && (targetName === 'client' || targetName === 'server')) {
      plugins.push(
         new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, target.distDir + '/**/*')],
         }),
      );
   }
   if (targetName === 'client') {
      plugins.push(
         new ThreadsPlugin({
            globalObject: 'self',
         }),
      );
      if (isProd()) {
         plugins.push(
            new ReplaceInFileWebpackPlugin([
               {
                  dir: target.distDir,
                  files: [target.output],
                  rules: [
                     {
                        search: '.worker.js',
                        replace: '.worker.js?' + Date.now(),
                     },
                  ],
               },
            ]),
            new ReplaceInFileWebpackPlugin([
               {
                  dir: target.distDir,
                  files: ['index.html'],
                  rules: [
                     {
                        // Avoid caching after build
                        search: target.output,
                        replace: `${target.output}?${Date.now()}`,
                     },
                     // {
                     //    search: `<meta name="base" content="${target.baseUrl}">`,
                     //    replace: `<meta name="base" content="${target.baseUrl}">\n<meta http-equiv="cache-control" content="no-cache" />`
                     // }
                  ],
               },
            ]),
            new CopyWebpackPlugin({ patterns: [{ from: target.assetDir, to: target.distAssetDir }] }),
         );
      } else {
         plugins.push(new HotModuleReplacementPlugin());
      }
      plugins.push(
         new HtmlWebPackPlugin({
            filename: 'index.html',
            title: target.title,
            meta: {
               base: '/',
               viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
               'theme-color': '#000000',
            },
         }),
      );

      plugins.push(
         new HtmlWebpackPartialsPlugin({
            path: './src/main/client/index.partial.html',
         }),
      );
   }

   /*
    * Minimizers
    */
   const minimizers = [
      new OptimizeJsPlugin({
         sourceMap: !isProd(),
      }),
      new OptimizeCssAssetsPlugin({
         cssProcessorPluginOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
         },
      }),
   ];

   if (isProd() && target.target === 'web') {
      minimizers.push(
         new TerserPlugin({
            parallel: false,
            terserOptions: {
               ecma: 2015,
               keep_classnames: false,
               keep_fnames: false,
               compress: {
                  drop_console: true,
               },
            },
         }),
      );
   }

   return {
      entry: path.resolve(__dirname, target.entry),
      watch: !isProd(),
      output: {
         path: path.resolve(__dirname, target.distDir),
         filename: target.output,
         pathinfo: false,
      },
      target: target.target,
      externals:
         target.target === 'node'
            ? [
                 nodeExternals({
                    // whitelist: [/^three/, /^shared/],
                 }),
              ]
            : [],
      devServer: {
         port: 8081,
      },
      resolve: {
         extensions: [
            '.tsx',
            ...(() => (isProd() ? ['.prod.ts'] : []))(), // This will override dev config with prod
            '.ts',
            '.js',
         ],
      },
      devtool: !isProd() ? 'inline-source-map' : false,
      module: {
         rules: [
            {
               test: /\.css$/,
               use: ['style-loader', 'css-loader'],
            },
            {
               test: /\.scss$/,
               use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
               test: /\.tsx?$/,
               use: [
                  {
                     loader: 'babel-loader',
                  },
                  {
                     loader: 'ts-loader',
                     options: {
                        transpileOnly: true, // Disabled due to performance reasons
                        experimentalWatchApi: !isProd(),
                        compilerOptions: {
                           module: 'esnext',
                        },
                     },
                  },
               ],
            },
            {
               test: /\.html$/,
               use: [
                  {
                     loader: 'html-loader',
                     options: {
                        minimize: true,
                     },
                  },
               ],
            },
            {
               test: /\.(png|jpg|jpeg|gif|svg|bin|glb|gltf|woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
               use: [
                  {
                     loader: 'file-loader',
                     options: {
                        name: '[path]/[name].[ext]',
                        outputPath: (url: string, resourcePath: string, context: string) => {
                           if (isProd()) {
                              // Remove "src/" from asset imports in prod. It is necessary only locally
                              return path.relative(context, resourcePath).replace(path.normalize('src/'), '');
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
                     loader: 'gltf-webpack-loader',
                  },
               ],
            },
         ],
      },
      optimization: {
         minimize: false, // isProd(),
         minimizer: minimizers,
      },
      plugins: plugins,
   };
};
