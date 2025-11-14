'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
type TargetAudience = 'ALL' | 'MEMBERS' | 'ADMINS'

interface Announcement {
  id: string
  title: string
  content: string
  priority: Priority
  targetAudience: TargetAudience
  publishedAt: string
  expiresAt?: string | null
  author: {
    id: string
    name: string
    email: string
  }
}

const priorityColors = {
  LOW: 'bg-gray-500',
  NORMAL: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
}

const priorityLabels = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('/api/announcements', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erro ao carregar avisos')
      }

      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error('Erro ao carregar avisos:', error)
      toast.error('Erro ao carregar avisos')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const isExpired = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return <LoadingState message="Carregando avisos..." />
  }

  const activeAnnouncements = announcements.filter((a) => !isExpired(a.expiresAt))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Avisos e Comunicados</h1>
        <p className="text-muted-foreground">
          Fique por dentro das novidades e informações importantes do grupo
        </p>
      </div>

      {activeAnnouncements.length === 0 ? (
        <EmptyState
          title="Nenhum aviso disponível"
          description="Não há avisos publicados no momento."
          icon="inbox"
        />
      ) : (
        <div className="grid gap-6">
          {activeAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={priorityColors[announcement.priority]}>
                        {priorityLabels[announcement.priority]}
                      </Badge>
                      {announcement.expiresAt && (
                        <span className="text-xs text-muted-foreground">
                          Expira em {new Date(announcement.expiresAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Por {announcement.author.name} •{' '}
                      {new Date(announcement.publishedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{announcement.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
