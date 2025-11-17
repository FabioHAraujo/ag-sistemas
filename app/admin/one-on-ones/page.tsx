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
  meetingDate: string
  location: string
  notes?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  memberOne: {
    id: string
    name: string
    email: string
  }
  memberTwo: {
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
  status: string
}

interface OneOnOneFormData {
  memberTwoId: string
  meetingDate: string
  meetingTime: string
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

export default function AdminOneOnOnesPage() {
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOneOnOne, setSelectedOneOnOne] = useState<OneOnOne | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState<OneOnOneFormData>({
    memberTwoId: '',
    meetingDate: '',
    meetingTime: '',
    location: '',
    notes: '',
  })

  const fetchOneOnOnes = useCallback(async () => {
    try {
      const response = await fetch('/api/one-on-ones', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar reuniões')
      }

      const data = await response.json()
      setOneOnOnes(data.meetings || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar reuniões')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch('/api/members?status=active', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar membros')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar membros')
    }
  }, [])

  useEffect(() => {
    fetchOneOnOnes()
    fetchMembers()
  }, [fetchOneOnOnes, fetchMembers])

  const handleOpenDialog = (oneOnOne?: OneOnOne) => {
    if (oneOnOne) {
      setSelectedOneOnOne(oneOnOne)
      const meetingDateTime = new Date(oneOnOne.meetingDate)
      setFormData({
        memberTwoId: oneOnOne.memberTwo.id,
        meetingDate: meetingDateTime.toISOString().slice(0, 10),
        meetingTime: meetingDateTime.toTimeString().slice(0, 5),
        location: oneOnOne.location,
        notes: oneOnOne.notes || '',
      })
    } else {
      setSelectedOneOnOne(null)
      setFormData({
        memberTwoId: '',
        meetingDate: '',
        meetingTime: '',
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
      memberTwoId: '',
      meetingDate: '',
      meetingTime: '',
      location: '',
      notes: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      const url = selectedOneOnOne ? `/api/one-on-ones/${selectedOneOnOne.id}` : '/api/one-on-ones'

      const meetingDateTime = new Date(`${formData.meetingDate}T${formData.meetingTime}`)

      const payload = {
        memberTwoId: formData.memberTwoId,
        meetingDate: meetingDateTime.toISOString(),
        location: formData.location,
        notes: formData.notes,
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

  const handleUpdateStatus = async (oneOnOne: OneOnOne, status: 'COMPLETED' | 'CANCELLED') => {
    setActionLoading(true)

    try {
      const response = await fetch(`/api/one-on-ones/${oneOnOne.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar reunião')
      }

      toast.success('Reunião atualizada com sucesso')
      fetchOneOnOnes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar reunião')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedOneOnOne) return

    setActionLoading(true)

    try {
      const response = await fetch(`/api/one-on-ones/${selectedOneOnOne.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir reunião')
      }

      toast.success('Reunião excluída com sucesso')
      setDeleteDialogOpen(false)
      setSelectedOneOnOne(null)
      fetchOneOnOnes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir reunião')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Carregando reuniões..." />
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestão de Reuniões 1-a-1</CardTitle>
            <CardDescription>Agende e gerencie reuniões individuais entre membros</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>Agendar Reunião</Button>
        </CardHeader>
        <CardContent>
          {oneOnOnes.length === 0 ? (
            <EmptyState
              title="Nenhuma reunião agendada"
              description="Comece agendando sua primeira reunião 1-a-1"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data e Hora</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Com</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oneOnOnes.map((oneOnOne) => (
                  <TableRow key={oneOnOne.id}>
                    <TableCell className="font-medium">
                      {new Date(oneOnOne.meetingDate).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>{oneOnOne.memberOne.name}</TableCell>
                    <TableCell>{oneOnOne.memberTwo.name}</TableCell>
                    <TableCell>{oneOnOne.location}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[oneOnOne.status]}>
                        {statusLabels[oneOnOne.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {oneOnOne.status === 'SCHEDULED' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(oneOnOne, 'COMPLETED')}
                              disabled={actionLoading}
                            >
                              Concluir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(oneOnOne)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(oneOnOne, 'CANCELLED')}
                              disabled={actionLoading}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedOneOnOne(oneOnOne)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
                <Label htmlFor="memberTwoId">Reunião com</Label>
                <Select
                  value={formData.memberTwoId}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, memberTwoId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="meetingDate">Data</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="meetingTime">Hora</Label>
                  <Input
                    id="meetingTime"
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    required
                  />
                </div>
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

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
