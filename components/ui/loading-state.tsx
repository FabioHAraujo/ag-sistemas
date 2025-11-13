'use client'

import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = 'Carregando...', fullScreen = false }: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton loader para tabelas
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`row-${i}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={`col-${i}-${j}`} className="h-8 bg-muted animate-pulse rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton loader para cards
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={`card-${i}`}>
          <CardContent className="p-6 space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
