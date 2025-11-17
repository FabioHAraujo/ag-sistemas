'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingState } from '@/components/ui/loading-state'

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  position: string | null
  bio: string | null
  linkedinUrl: string | null
  role: 'ADMIN' | 'MEMBER'
  isActive: boolean
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: 'active', // Only show active members
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/members?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar membros')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar membros')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  if (loading) {
    return <LoadingState message="Carregando membros..." />
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Diretório de Membros</CardTitle>
            <CardDescription>Conecte-se com outros membros do grupo</CardDescription>
          </div>
          <Input
            placeholder="Buscar por nome, empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80"
          />
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <EmptyState
              title="Nenhum membro encontrado"
              description="Ajuste a busca para ver mais resultados"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        {member.position && member.company && (
                          <CardDescription>
                            {member.position} @ {member.company}
                          </CardDescription>
                        )}
                      </div>
                      {member.role === 'ADMIN' && (
                        <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {member.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{member.bio}</p>
                      )}

                      <div className="space-y-1">
                        {member.email && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Email:</span>{' '}
                            <a
                              href={`mailto:${member.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {member.email}
                            </a>
                          </p>
                        )}
                        {member.phone && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Telefone:</span> {member.phone}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {member.linkedinUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              LinkedIn
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/member/one-on-ones?participantId=${member.id}`}>
                            Agendar 1-a-1
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
