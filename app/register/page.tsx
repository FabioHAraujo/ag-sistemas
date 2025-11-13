'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type RegistrationFormData, registrationSchema } from '@/lib/validators/registration'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      phone: '',
      position: '',
      bio: '',
    },
  })

  useEffect(() => {
    if (!token) {
      setTokenError('Token de convite não fornecido')
    }
  }, [token])

  async function onSubmit(data: RegistrationFormData) {
    if (!token) return

    setIsSubmitting(true)

    try {
      // biome-ignore lint/correctness/noUnusedVariables: confirmPassword is intentionally destructured to exclude it
      const { confirmPassword, ...submitData } = data

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...submitData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao completar cadastro')
      }

      // Redirecionar para dashboard ou página de boas-vindas
      alert('Cadastro realizado com sucesso! Bem-vindo(a)!')
      router.push('/')
    } catch (error) {
      console.error('Submit error:', error)
      alert(error instanceof Error ? error.message : 'Erro ao completar cadastro')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (tokenError) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Erro</CardTitle>
            <CardDescription className="text-center text-destructive">{tokenError}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Seu Cadastro</CardTitle>
          <CardDescription>
            Você foi aprovado! Preencha os dados abaixo para finalizar seu cadastro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere
                      especial
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+5511999999999" {...field} />
                    </FormControl>
                    <FormDescription>Formato: +55 (DDD) NÚMERO</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo/Posição</FormLabel>
                    <FormControl>
                      <Input placeholder="CEO, Diretor, Gerente..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Conte-nos um pouco sobre você e sua experiência profissional..."
                        className="min-h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Mínimo 50 caracteres, máximo 500 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Completar Cadastro'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
