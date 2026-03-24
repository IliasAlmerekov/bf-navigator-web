import { createFileRoute } from '@tanstack/react-router'
import RouteOverview from '../pages/RouteOverview'

export const Route = createFileRoute('/route-overview')({
  component: RouteOverview,
})
