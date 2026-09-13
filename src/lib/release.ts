import { useEffect, useState } from 'octane'
import packageJson from '../../package.json'

type GitHubRelease = {
  tag_name?: string
}

export type BeastRelease = {
  version: string
  source: 'github' | 'package'
}

const githubReleasesUrl = 'https://api.github.com/repos/phtn/beast/releases/latest'
const fallbackVersion = `v${packageJson.version}`

export const fallbackRelease: BeastRelease = {
  version: fallbackVersion,
  source: 'package'
}

function normalizeVersion(tagName?: string) {
  if (!tagName) return fallbackVersion
  return tagName.startsWith('v') ? tagName : `v${tagName}`
}

let releasePromise: Promise<BeastRelease> | undefined

export function getBeastRelease(): Promise<BeastRelease> {
  releasePromise ??= (async () => {
    try {
      const response = await fetch(githubReleasesUrl, {
        headers: { Accept: 'application/vnd.github+json' }
      })

      if (!response.ok) {
        throw new Error(`GitHub releases request failed with ${response.status}`)
      }

      const release = (await response.json()) as GitHubRelease

      return {
        version: normalizeVersion(release.tag_name),
        source: 'github' as const
      }
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
