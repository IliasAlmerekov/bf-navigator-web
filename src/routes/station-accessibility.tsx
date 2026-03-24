import { createFileRoute } from '@tanstack/react-router'
import StationAccessibility from '../pages/StationAccessibility'

export const Route = createFileRoute('/station-accessibility')({
  component: StationAccessibility,
})
