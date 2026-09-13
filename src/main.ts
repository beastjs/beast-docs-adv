import { createRoot } from 'octane'
import Root from './Root.btsx'
import './style.css'

const container = document.getElementById('app')
if (container === null) throw new Error('Missing #app container.')

createRoot(container).render(Root, {})
