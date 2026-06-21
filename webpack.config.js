import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, 'zombierun')

const { version } = JSON.parse(
  fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'),
)

const htmlTemplate = fs
  .readFileSync(path.join(appRoot, 'index.html'), 'utf8')
  .replace(/<script type="module" src="\/src\/main\.ts"><\/script>\s*/, '')
  .replace(/\s(href|src)="\/([^"]+)"/g, ' $1="./$2"')

export default {
  mode: 'production',
  entry: path.join(appRoot, 'src/main.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash].js',
    clean: true,
    publicPath: './',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.join(appRoot, 'node_modules'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        options: { target: 'es2023' },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __APP_VERSION__: JSON.stringify(version),
      'import.meta.env.DEV': JSON.stringify(false),
      'import.meta.env.PROD': JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      templateContent: htmlTemplate,
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(appRoot, 'public'), to: '.' }],
    }),
  ],
}
