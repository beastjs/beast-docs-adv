import { HtmlRspackPlugin, type Configuration } from '@rspack/core'
import { beastOctane } from 'beast-tsrx/rspack'
import { fileURLToPath } from 'node:url'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const config: Configuration = {
  entry: './src/main.ts',
  output: { publicPath: '/' },
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
  plugins: [new HtmlRspackPlugin({ template: './index.html' }), beastOctane()],
  devServer: { historyApiFallback: true }
}

export default config
