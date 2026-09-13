import { useSyncExternalStore } from 'octane'

// A minimal History API router. The site has three route shapes (`/`, `/docs`,
// `/docs/*`), so a full router library isn't worth its ~135 KiB.

const NAVIGATE_EVENT = 'beast:navigate'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATE_EVENT, onChange)
  }
}

function getPathname() {
  return normalizePath(window.location.pathname)
}

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getPathname, () => '/')
}

export function navigate(to: string) {
  const url = new URL(to, window.location.href)
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href)
    return
  }

  const samePage = normalizePath(url.pathname) === getPathname()
  window.history.pushState(null, '', url.pathname + url.search + url.hash)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))

  if (url.hash) {
    document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView()
  } else if (!samePage) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }
}

// Route chunks, shared by the app shell and link preloading.
export const loadHome = () => import(/* webpackChunkName: "home" */ '../App.btsx')
export const loadDocs = () => import(/* webpackChunkName: "docs" */ '../pages/docs.btsx')

export function preload(to: string) {
  const pathname = normalizePath(new URL(to, window.location.href).pathname)
  if (pathname === '/') void loadHome()
  else if (pathname === '/docs' || pathname.startsWith('/docs/')) void loadDocs()
}

export function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented
}
