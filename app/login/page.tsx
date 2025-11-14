'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Verificar se já está autenticado ao carregar a página
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (response.ok) {
          // Já está autenticado, redirecionar
          const redirectTo = searchParams.get('redirect')
          if (redirectTo) {
            router.push(redirectTo)
          } else {
            const data = await response.json()
            router.push(
              data.user.role === 'ADMIN' ? '/admin/applications' : '/member/announcements'
            )
          }
        }
      } catch {
        // Não autenticado, continuar na página de login
      }
    }

    // Só verificar auth se não estiver no meio de um submit
    const urlParams = new URLSearchParams(window.location.search)
    if (!urlParams.has('from-submit')) {
      checkAuth()
    }
  }, [router, searchParams])

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer login')
      }

      // Aguardar um pouco para o cookie ser setado
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verificar se há um redirect parameter na URL
      const redirectTo = searchParams.get('redirect')

      if (redirectTo) {
        // Redirecionar para a página solicitada
        router.push(redirectTo)
      } else {
        // Redirecionar baseado no role
        if (result.user.role === 'ADMIN') {
          router.push('/admin/applications')
        } else {
          router.push('/member/announcements')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Entre com suas credenciais para acessar a plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
