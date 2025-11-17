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

interface Meeting {
  id: string
  title: string
  description: string | null
  meetingDate: string
  location: string
  type: 'MONTHLY' | 'SPECIAL' | 'WORKSHOP'
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  maxAttendees: number | null
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
  }
  attendances: Array<{
    id: string
    attended: boolean
    member: {
      id: string
      name: string
    }
  }>
}

interface MeetingFormData {
  title: string
  description: string
  meetingDate: string
  meetingTime: string
  location: string
  type: 'MONTHLY' | 'SPECIAL' | 'WORKSHOP'
  maxAttendees: string
}

const typeColors = {
  MONTHLY: 'bg-blue-100 text-blue-800',
  SPECIAL: 'bg-purple-100 text-purple-800',
  WORKSHOP: 'bg-green-100 text-green-800',
}

const typeLabels = {
  MONTHLY: 'Mensal',
  SPECIAL: 'Especial',
  WORKSHOP: 'Workshop',
}

const statusColors = {
  SCHEDULED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    meetingDate: '',
    meetingTime: '',
    location: '',
    type: 'MONTHLY',
    maxAttendees: '',
  })

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch('/api/meetings', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar reuniões')
      }

      const data = await response.json()
      setMeetings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar reuniões')
      setMeetings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const handleOpenDialog = (meeting?: Meeting) => {
    if (meeting) {
      setSelectedMeeting(meeting)
      const meetingDateTime = new Date(meeting.meetingDate)
      setFormData({
        title: meeting.title,
        description: meeting.description || '',
        meetingDate: meetingDateTime.toISOString().slice(0, 10), // YYYY-MM-DD
        meetingTime: meetingDateTime.toTimeString().slice(0, 5), // HH:MM
        location: meeting.location,
        type: meeting.type,
        maxAttendees: meeting.maxAttendees?.toString() || '',
      })
    } else {
      setSelectedMeeting(null)
      setFormData({
        title: '',
        description: '',
        meetingDate: '',
        meetingTime: '',
        location: '',
        type: 'MONTHLY',
        maxAttendees: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedMeeting(null)
    setFormData({
      title: '',
      description: '',
      meetingDate: '',
      meetingTime: '',
      location: '',
      type: 'MONTHLY',
      maxAttendees: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      const url = selectedMeeting ? `/api/meetings/${selectedMeeting.id}` : '/api/meetings'

      // Combinar data e hora
      const meetingDateTime = new Date(`${formData.meetingDate}T${formData.meetingTime}`)

      const payload = {
        title: formData.title,
        description: formData.description,
        meetingDate: meetingDateTime.toISOString(),
        location: formData.location,
        type: formData.type,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees, 10) : null,
      }

      const response = await fetch(url, {
        method: selectedMeeting ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar reunião')
      }

      toast.success(
        selectedMeeting ? 'Reunião atualizada com sucesso' : 'Reunião criada com sucesso'
      )
      handleCloseDialog()
      fetchMeetings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar reunião')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateStatus = async (meeting: Meeting, status: 'COMPLETED' | 'CANCELLED') => {
    setActionLoading(true)

    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
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
      fetchMeetings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar reunião')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMeeting) return

    setActionLoading(true)

    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir reunião')
      }

      toast.success('Reunião excluída com sucesso')
      setDeleteDialogOpen(false)
      setSelectedMeeting(null)
      fetchMeetings()
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
            <CardTitle>Gestão de Reuniões</CardTitle>
            <CardDescription>Agende e gerencie reuniões do grupo</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>Nova Reunião</Button>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <EmptyState
              title="Nenhuma reunião agendada"
              description="Comece criando sua primeira reunião"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data e Hora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Organizador</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell>
                      {new Date(meeting.meetingDate).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>{meeting.location}</TableCell>
                    <TableCell>
                      <Badge className={typeColors[meeting.type]}>{typeLabels[meeting.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[meeting.status]}>
                        {statusLabels[meeting.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meeting.attendances.filter((a) => a.attended).length} /{' '}
                      {meeting.attendances.length}
                    </TableCell>
                    <TableCell>{meeting.creator.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMeeting(meeting)
                            setAttendanceDialogOpen(true)
                          }}
                        >
                          Presenças
                        </Button>
                        {meeting.status === 'SCHEDULED' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(meeting)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(meeting, 'COMPLETED')}
                              disabled={actionLoading}
                            >
                              Concluir
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedMeeting(meeting)
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
            <DialogTitle>{selectedMeeting ? 'Editar Reunião' : 'Nova Reunião'}</DialogTitle>
            <DialogDescription>
              {selectedMeeting
                ? 'Edite as informações da reunião'
                : 'Preencha as informações da nova reunião'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'MONTHLY' | 'SPECIAL' | 'WORKSHOP') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="SPECIAL">Especial</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxAttendees">Máx. Participantes (opcional)</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    placeholder="Sem limite"
                  />
                </div>
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
              Tem certeza que deseja excluir a reunião "{selectedMeeting?.title}"? Esta ação não
              pode ser desfeita.
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

      {/* Dialog de Presenças */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lista de Presenças</DialogTitle>
            <DialogDescription>
              {selectedMeeting?.title} -{' '}
              {selectedMeeting && new Date(selectedMeeting.meetingDate).toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedMeeting?.attendances.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhum membro registrou presença ainda
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead className="text-center">Presença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMeeting?.attendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell>{attendance.member.name}</TableCell>
                      <TableCell className="text-center">
                        {attendance.attended ? (
                          <Badge className="bg-green-100 text-green-800">Presente</Badge>
                        ) : (
                          <Badge variant="secondary">Ausente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setAttendanceDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
