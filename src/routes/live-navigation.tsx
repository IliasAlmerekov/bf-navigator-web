import { createFileRoute } from '@tanstack/react-router'
import LiveNavigation from '../pages/LiveNavigation'

export const Route = createFileRoute('/live-navigation')({
  component: LiveNavigation,
})
