'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page Error:', error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Erro ao carregar página</CardTitle>
          <CardDescription>Ocorreu um problema ao carregar esta página.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-mono">{error.message}</p>
            </div>
          )}
          <Button onClick={reset} variant="default" className="w-full">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
