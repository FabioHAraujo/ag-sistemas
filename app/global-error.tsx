'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para serviço de monitoramento (Sentry, etc)
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">Algo deu errado!</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && (
                <div className="rounded-md bg-muted p-3">
                  <pre className="text-xs">{error.message}</pre>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={reset} variant="default" className="flex-1">
                  Tentar novamente
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/'
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Ir para início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
