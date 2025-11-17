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

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  audience: 'ALL' | 'MEMBERS' | 'ADMINS'
  published: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

interface AnnouncementFormData {
  title: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  audience: 'ALL' | 'MEMBERS' | 'ADMINS'
  published: boolean
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
}

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
}

const audienceLabels = {
  ALL: 'Todos',
  MEMBERS: 'Membros',
  ADMINS: 'Administradores',
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    priority: 'MEDIUM',
    audience: 'ALL',
    published: false,
  })

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('/api/announcements', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar avisos')
      }

      const data = await response.json()
      setAnnouncements(data.announcements)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar avisos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setSelectedAnnouncement(announcement)
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        audience: announcement.audience,
        published: announcement.published,
      })
    } else {
      setSelectedAnnouncement(null)
      setFormData({
        title: '',
        content: '',
        priority: 'MEDIUM',
        audience: 'ALL',
        published: false,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedAnnouncement(null)
    setFormData({
      title: '',
      content: '',
      priority: 'MEDIUM',
      audience: 'ALL',
      published: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      const url = selectedAnnouncement
        ? `/api/announcements/${selectedAnnouncement.id}`
        : '/api/announcements'

      const response = await fetch(url, {
        method: selectedAnnouncement ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar aviso')
      }

      toast.success(
        selectedAnnouncement ? 'Aviso atualizado com sucesso' : 'Aviso criado com sucesso'
      )
      handleCloseDialog()
      fetchAnnouncements()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar aviso')
    } finally {
      setActionLoading(false)
    }
  }

  const handleTogglePublish = async (announcement: Announcement) => {
    setActionLoading(true)

    try {
      const response = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ published: !announcement.published }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar aviso')
      }

      toast.success(
        announcement.published ? 'Aviso despublicado com sucesso' : 'Aviso publicado com sucesso'
      )
      fetchAnnouncements()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar aviso')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedAnnouncement) return

    setActionLoading(true)

    try {
      const response = await fetch(`/api/announcements/${selectedAnnouncement.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir aviso')
      }

      toast.success('Aviso excluído com sucesso')
      setDeleteDialogOpen(false)
      setSelectedAnnouncement(null)
      fetchAnnouncements()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir aviso')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Carregando avisos..." />
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestão de Avisos</CardTitle>
            <CardDescription>Crie e gerencie avisos para os membros</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>Novo Aviso</Button>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <EmptyState
              title="Nenhum aviso encontrado"
              description="Comece criando seu primeiro aviso"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Público</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>
                      <Badge className={priorityColors[announcement.priority]}>
                        {priorityLabels[announcement.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>{audienceLabels[announcement.audience]}</TableCell>
                    <TableCell>
                      <Badge variant={announcement.published ? 'default' : 'secondary'}>
                        {announcement.published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>{announcement.author.name}</TableCell>
                    <TableCell>{new Date(announcement.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePublish(announcement)}
                          disabled={actionLoading}
                        >
                          {announcement.published ? 'Despublicar' : 'Publicar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(announcement)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedAnnouncement(announcement)
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
            <DialogTitle>{selectedAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement
                ? 'Edite as informações do aviso'
                : 'Preencha as informações do novo aviso'}
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
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="audience">Público</Label>
                  <Select
                    value={formData.audience}
                    onValueChange={(value: 'ALL' | 'MEMBERS' | 'ADMINS') =>
                      setFormData({ ...formData, audience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="MEMBERS">Membros</SelectItem>
                      <SelectItem value="ADMINS">Administradores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publicar imediatamente
                </Label>
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
              Tem certeza que deseja excluir o aviso "{selectedAnnouncement?.title}"? Esta ação não
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
    </div>
  )
}
