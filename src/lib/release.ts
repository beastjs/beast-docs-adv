import { useEffect, useState } from 'octane'

export type BeastRelease = {
  version: string
  source: 'npm' | 'build'
}

// Beast ships as `beast-tsrx` on npm (and `bun create beast@latest` installs
// it), so the registry's `latest` dist-tag is the current version. The GitHub
// repo has no Releases and its tags lag behind npm, so it isn't used.
const npmLatestUrl = 'https://registry.npmjs.org/beast-tsrx/latest'

// Injected by rspack.config.ts from the installed beast-tsrx package, so the
// first render (and any offline visit) shows a real version.
export const fallbackRelease: BeastRelease = {
  version: formatVersion(__BEAST_VERSION__),
  source: 'build'
}

function formatVersion(version: string) {
  return version.startsWith('v') ? version : `v${version}`
}

let releasePromise: Promise<BeastRelease> | undefined

export function getBeastRelease(): Promise<BeastRelease> {
  releasePromise ??= (async () => {
    try {
      const response = await fetch(npmLatestUrl, { headers: { Accept: 'application/json' } })
      if (!response.ok) {
        throw new Error(`npm registry request failed with ${response.status}`)
      }

      const { version } = (await response.json()) as { version?: unknown }
      if (typeof version !== 'string' || !version) {
        throw new Error('npm registry response has no version')
      }

      return { version: formatVersion(version), source: 'npm' as const }
    } catch {
      return fallbackRelease
    }
  })()
  return releasePromise
}

export function useBeastRelease(): BeastRelease {
  const [release, setRelease] = useState<BeastRelease>(fallbackRelease)

  useEffect(() => {
    let active = true
    getBeastRelease().then((next) => {
      if (active) setRelease(next)
    })
    return () => {
      active = false
    }
  }, [])

  return release
}
