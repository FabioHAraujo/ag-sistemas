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
  createdAt: string
  updatedAt: string
  _count?: {
    meetingAttendances: number
    referralsGiven: number
    referralsReceived: number
  }
}

interface MemberFormData {
  name: string
  email: string
  phone: string
  company: string
  position: string
  bio: string
  linkedinUrl: string
  role: 'ADMIN' | 'MEMBER'
}

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-800',
  MEMBER: 'bg-blue-100 text-blue-800',
}

const roleLabels = {
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    bio: '',
    linkedinUrl: '',
    role: 'MEMBER',
  })

  const fetchMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }
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
      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar membros')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus, searchQuery])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleOpenDialog = (member: Member) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      company: member.company || '',
      position: member.position || '',
      bio: member.bio || '',
      linkedinUrl: member.linkedinUrl || '',
      role: member.role,
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedMember(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      bio: '',
      linkedinUrl: '',
      role: 'MEMBER',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    setActionLoading(true)

    try {
      const response = await fetch(`/api/members/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar membro')
      }

      toast.success('Membro atualizado com sucesso')
      handleCloseDialog()
      fetchMembers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar membro')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (member: Member) => {
    setActionLoading(true)

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !member.isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar status')
      }

      toast.success(
        member.isActive ? 'Membro desativado com sucesso' : 'Membro ativado com sucesso'
      )
      fetchMembers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedMember) return

    setActionLoading(true)

    try {
      const response = await fetch(`/api/members/${selectedMember.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao desativar membro')
      }

      toast.success('Membro desativado com sucesso')
      setDeactivateDialogOpen(false)
      setSelectedMember(null)
      fetchMembers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao desativar membro')
    } finally {
      setActionLoading(false)
    }
  }

  const stats = {
    total: members.length,
    active: members.filter((m) => m.isActive).length,
    inactive: members.filter((m) => !m.isActive).length,
    admins: members.filter((m) => m.role === 'ADMIN').length,
  }

  if (loading) {
    return <LoadingState message="Carregando membros..." />
  }

  return (
    <div className="container mx-auto py-10">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Membros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestão de Membros</CardTitle>
            <CardDescription>Gerencie os membros do grupo</CardDescription>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80"
            />
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <EmptyState
              title="Nenhum membro encontrado"
              description="Ajuste os filtros para ver mais resultados"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Membro desde</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.company || '-'}</TableCell>
                    <TableCell>{member.position || '-'}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[member.role]}>{roleLabels[member.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(member.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(member)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={member.isActive ? 'secondary' : 'default'}
                          onClick={() => handleToggleActive(member)}
                          disabled={actionLoading}
                        >
                          {member.isActive ? 'Desativar' : 'Ativar'}
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

      {/* Dialog de Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>Edite as informações do membro</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'ADMIN' | 'MEMBER') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Membro</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://www.linkedin.com/in/..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Breve descrição profissional..."
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

      {/* Dialog de Confirmação de Desativação */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desativação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desativar "{selectedMember?.name}"? O membro não poderá mais
              acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={actionLoading}>
              {actionLoading ? 'Desativando...' : 'Desativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
