import { DefinePlugin, HtmlRspackPlugin, type Configuration } from '@rspack/core'
import { beastOctane } from 'beast-tsrx/rspack'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
// The installed Beast version, used until the live npm version loads.
const beastVersion: string = JSON.parse(
  readFileSync(new URL('./node_modules/beast-tsrx/package.json', import.meta.url), 'utf8')
).version
const config: Configuration = {
  entry: './src/main.ts',
  output: {
    publicPath: '/',
    clean: true,
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].js',
    cssFilename: '[name].[contenthash:8].css',
    cssChunkFilename: '[name].[contenthash:8].css'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // The Octane runtime changes rarely; keep it in a long-lived chunk.
        framework: {
          test: /[\\/]node_modules[\\/](octane|@octanejs)[\\/]/u,
          name: 'framework',
          priority: 20
        },
        highlight: {
          test: /[\\/](node_modules[\\/]highlight\.js|src[\\/]lib[\\/]btsx-hljs)/u,
          name: 'highlight',
          chunks: 'async',
          priority: 30
        }
      }
    }
  },
  // Always list emitted assets with their sizes, not only when over budget.
  stats: {
    preset: 'errors-warnings',
    assets: true,
    assetsSort: '!size',
    cachedAssets: true,
    assetsSpace: 50,
    groupAssetsByEmitStatus: false,
    groupAssetsByInfo: false,
    groupAssetsByPath: false,
    groupAssetsByExtension: false,
    groupAssetsByChunk: false
  },
  experiments: { css: true },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.btsx', '.mdx'],
    // `@octanejs/day-picker` ships TypeScript sources that import with explicit
    // `.js` extensions (NodeNext style). Without this mapping those specifiers
    // resolve against the non-existent emitted files and the package fails.
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js']
    },
    alias: {
      '@': srcDir
    }
  },
  module: { rules: [{ test: /\.css$/u, type: 'css', use: ['postcss-loader'] }] },
  plugins: [
    new HtmlRspackPlugin({ template: './index.html' }),
    new DefinePlugin({ __BEAST_VERSION__: JSON.stringify(beastVersion) }),
    beastOctane()
  ],
  devServer: { historyApiFallback: true }
}

export default config
