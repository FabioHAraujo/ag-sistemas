'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Application {
  id: string
  name: string
  email: string
  company: string
  motivation: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt?: string
  token?: string
  reviewer?: {
    id: string
    name: string
    email: string
  }
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [registrationLink, setRegistrationLink] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch('/api/applications')
      if (!response.ok) throw new Error('Erro ao carregar intenções')

      const data = await response.json()
      setApplications(data.applications)
    } catch (error) {
      console.error('Fetch error:', error)
      alert('Erro ao carregar intenções')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  async function handleApprove(id: string) {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${id}/approve`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Erro ao aprovar')

      const data = await response.json()
      setRegistrationLink(data.registrationLink)

      // Atualizar lista
      await fetchApplications()
      setSelectedApp(null)
    } catch (error) {
      console.error('Approve error:', error)
      alert('Erro ao aprovar intenção')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(id: string) {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${id}/reject`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Erro ao rejeitar')

      // Atualizar lista
      await fetchApplications()
      setSelectedApp(null)
    } catch (error) {
      console.error('Reject error:', error)
      alert('Erro ao rejeitar intenção')
    } finally {
      setActionLoading(false)
    }
  }

  function getStatusBadge(status: Application['status']) {
    const variants = {
      PENDING: 'default',
      APPROVED: 'default',
      REJECTED: 'destructive',
    } as const

    const labels = {
      PENDING: 'Pendente',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
    }

    return (
      <Badge variant={variants[status]} className={status === 'APPROVED' ? 'bg-green-500' : ''}>
        {labels[status]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Intenções de Participação</CardTitle>
          <CardDescription>Revise e aprove/rejeite as intenções de novos membros</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma intenção encontrada
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{new Date(app.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {app.status === 'PENDING' && (
                        <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                          Revisar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Revisão */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Intenção</DialogTitle>
            <DialogDescription>Detalhes da intenção de participação</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Nome</h3>
                <p>{selectedApp.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>{selectedApp.email}</p>
              </div>
              <div>
                <h3 className="font-semibold">Empresa</h3>
                <p>{selectedApp.company}</p>
              </div>
              <div>
                <h3 className="font-semibold">Motivação</h3>
                <p className="text-sm text-muted-foreground">{selectedApp.motivation}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedApp(null)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApp && handleReject(selectedApp.id)}
              disabled={actionLoading}
            >
              Rejeitar
            </Button>
            <Button
              onClick={() => selectedApp && handleApprove(selectedApp.id)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processando...' : 'Aprovar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Link de Registro */}
      <Dialog open={!!registrationLink} onOpenChange={() => setRegistrationLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Intenção Aprovada! 🎉</DialogTitle>
            <DialogDescription>Link de registro gerado com sucesso</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm">
              O link abaixo foi enviado por email (console) para o candidato:
            </p>
            <div className="rounded-md bg-muted p-3">
              <code className="text-xs break-all">{registrationLink}</code>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setRegistrationLink(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
