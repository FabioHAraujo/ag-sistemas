'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/ui/loading-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

interface OneOnOne {
  id: string
  scheduledDate: string
  location: string
  notes?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  requestedBy: {
    id: string
    name: string
    email: string
  }
  requestedWith: {
    id: string
    name: string
    email: string
  }
}

interface Member {
  id: string
  name: string
  email: string
  role: string
}

interface OneOnOneFormData {
  requestedWithId: string
  scheduledDate: string
  location: string
  notes: string
}

const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

export default function MemberOneOnOnesPage() {
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOneOnOne, setSelectedOneOnOne] = useState<OneOnOne | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [formData, setFormData] = useState<OneOnOneFormData>({
    requestedWithId: '',
    scheduledDate: '',
    location: '',
    notes: '',
  })

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar usuário')
      }

      const data = await response.json()
      setCurrentUserId(data.user.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar usuário')
    }
  }, [])

  const fetchOneOnOnes = useCallback(async () => {
    try {
      const response = await fetch('/api/one-on-ones', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar reuniões')
      }

      const data = await response.json()
      setOneOnOnes(data.oneOnOnes)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar reuniões')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar membros')
      }

      const data = await response.json()
      setMembers(data.users.filter((u: Member) => u.role === 'MEMBER'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar membros')
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
    fetchOneOnOnes()
    fetchMembers()
  }, [fetchCurrentUser, fetchOneOnOnes, fetchMembers])

  const handleOpenDialog = (oneOnOne?: OneOnOne) => {
    if (oneOnOne) {
      setSelectedOneOnOne(oneOnOne)
      setFormData({
        requestedWithId: oneOnOne.requestedWith.id,
        scheduledDate: new Date(oneOnOne.scheduledDate).toISOString().slice(0, 16),
        location: oneOnOne.location,
        notes: oneOnOne.notes || '',
      })
    } else {
      setSelectedOneOnOne(null)
      setFormData({
        requestedWithId: '',
        scheduledDate: '',
        location: '',
        notes: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedOneOnOne(null)
    setFormData({
      requestedWithId: '',
      scheduledDate: '',
      location: '',
      notes: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      const url = selectedOneOnOne ? `/api/one-on-ones/${selectedOneOnOne.id}` : '/api/one-on-ones'

      const payload = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
      }

      const response = await fetch(url, {
        method: selectedOneOnOne ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar reunião')
      }

      toast.success(
        selectedOneOnOne ? 'Reunião atualizada com sucesso' : 'Reunião agendada com sucesso'
      )
      handleCloseDialog()
      fetchOneOnOnes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar reunião')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async (oneOnOne: OneOnOne) => {
    setActionLoading(true)

    try {
      const response = await fetch(`/api/one-on-ones/${oneOnOne.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao cancelar reunião')
      }

      toast.success('Reunião cancelada com sucesso')
      fetchOneOnOnes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar reunião')
    } finally {
      setActionLoading(false)
    }
  }

  const canEdit = (oneOnOne: OneOnOne) => {
    return oneOnOne.requestedBy.id === currentUserId || oneOnOne.requestedWith.id === currentUserId
  }

  const canDelete = (oneOnOne: OneOnOne) => {
    return oneOnOne.requestedBy.id === currentUserId
  }

  if (loading) {
    return <LoadingState message="Carregando reuniões..." />
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Minhas Reuniões 1-a-1</CardTitle>
            <CardDescription>Agende e gerencie suas reuniões individuais</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>Agendar Reunião</Button>
        </CardHeader>
        <CardContent>
          {oneOnOnes.length === 0 ? (
            <EmptyState
              title="Nenhuma reunião agendada"
              description="Agende uma reunião 1-a-1 com outro membro para começar"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data e Hora</TableHead>
                  <TableHead>Com</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oneOnOnes.map((oneOnOne) => {
                  const isRequestedBy = oneOnOne.requestedBy.id === currentUserId
                  const otherPerson = isRequestedBy ? oneOnOne.requestedWith : oneOnOne.requestedBy

                  return (
                    <TableRow key={oneOnOne.id}>
                      <TableCell className="font-medium">
                        {new Date(oneOnOne.scheduledDate).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell>{otherPerson.name}</TableCell>
                      <TableCell>{oneOnOne.location}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[oneOnOne.status]}>
                          {statusLabels[oneOnOne.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{oneOnOne.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {oneOnOne.status === 'SCHEDULED' && (
                            <>
                              {canEdit(oneOnOne) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenDialog(oneOnOne)}
                                >
                                  Editar
                                </Button>
                              )}
                              {canDelete(oneOnOne) && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancel(oneOnOne)}
                                  disabled={actionLoading}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOneOnOne ? 'Editar Reunião' : 'Agendar Reunião 1-a-1'}
            </DialogTitle>
            <DialogDescription>
              {selectedOneOnOne
                ? 'Edite as informações da reunião'
                : 'Preencha as informações para agendar uma nova reunião'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="requestedWithId">Reunião com</Label>
                <Select
                  value={formData.requestedWithId}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, requestedWithId: value })
                  }
                  disabled={!!selectedOneOnOne}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {members
                      .filter((m) => m.id !== currentUserId)
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">Data e Hora</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Sala de reuniões, Online via Zoom, etc."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Adicione informações adicionais sobre a reunião..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
