// Print the size of every file in dist/: raw, gzip, and brotli.
// Files referenced by index.html load on first visit; everything else is a
// lazily loaded chunk. Run `bun run build` first, or use `bun run build:size`.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

const distDir = join(import.meta.dirname, '..', 'dist')

let files: string[]
try {
  files = readdirSync(distDir).filter((file) => /\.(js|css)$/.test(file))
} catch {
  console.error('No dist/ directory. Run `bun run build` first.')
  process.exit(1)
}

const html = readFileSync(join(distDir, 'index.html'), 'utf8')
const kib = (bytes: number) => `${(bytes / 1024).toFixed(1)} KiB`

type Row = { file: string; raw: number; gzip: number; brotli: number; initial: boolean }

const rows: Row[] = files.map((file) => {
  const buffer = readFileSync(join(distDir, file))
  return {
    file,
    raw: statSync(join(distDir, file)).size,
    gzip: gzipSync(buffer, { level: 9 }).length,
    brotli: brotliCompressSync(buffer, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
    }).length,
    initial: html.includes(file)
  }
})

function printGroup(title: string, group: Row[]) {
  if (group.length === 0) return
  group.sort((a, b) => b.raw - a.raw)
  const width = Math.max(...group.map((row) => row.file.length), title.length)
  console.log(`\n${title.padEnd(width)}  ${'raw'.padStart(10)}  ${'gzip'.padStart(10)}  ${'brotli'.padStart(10)}`)
  for (const row of group) {
    console.log(`${row.file.padEnd(width)}  ${kib(row.raw).padStart(10)}  ${kib(row.gzip).padStart(10)}  ${kib(row.brotli).padStart(10)}`)
  }
  const sum = (key: 'raw' | 'gzip' | 'brotli') => group.reduce((total, row) => total + row[key], 0)
  console.log(`${'total'.padEnd(width)}  ${kib(sum('raw')).padStart(10)}  ${kib(sum('gzip')).padStart(10)}  ${kib(sum('brotli')).padStart(10)}`)
}

printGroup('Initial (index.html)', rows.filter((row) => row.initial))
printGroup('Lazy chunks', rows.filter((row) => !row.initial))
