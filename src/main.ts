import { createRootRoute, createRoute, createRouter, RouterProvider } from '@octanejs/tanstack-router'
import { createRoot } from 'octane'
import App from './App.btsx'
import DocsPage from './pages/docs.btsx'
import './style.css'

const rootRoute = createRootRoute()
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: App })
const docsIndexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/docs', component: DocsPage })
const docsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/docs/$', component: DocsPage })

const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, docsIndexRoute, docsRoute])
})

declare module '@octanejs/tanstack-router' {
  interface Register {
    router: typeof router
  }
}

const container = document.getElementById('app')
if (container === null) throw new Error('Missing #app container.')

createRoot(container).render(RouterProvider, { router })
