import { createFileRoute } from '@tanstack/react-router'
import AlternativeRoutes from '../pages/AlternativeRoutes'

export const Route = createFileRoute('/alternative-routes')({
  component: AlternativeRoutes,
})
