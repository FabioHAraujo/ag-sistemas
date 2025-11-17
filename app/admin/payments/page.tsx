'use client'

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  DollarSign,
  Plus,
  TrendingUp,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import { cn } from '@/lib/utils'

type Payment = {
  id: string
  amount: number
  dueDate: string
  paidAt: string | null
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  paymentMethod: string | null
  notes: string | null
  member: {
    id: string
    name: string
    email: string
  }
  membership: {
    id: string
    planType: string
  }
}

type Member = {
  id: string
  name: string
  email: string
  isActive: boolean
  role: 'MEMBER' | 'ADMIN'
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [includeAdmins, setIncludeAdmins] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    planType: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'SINGLE',
    dueDate: '',
  })

  const fetchPayments = useCallback(async () => {
    try {
      const url = statusFilter === 'all' ? '/api/payments' : `/api/payments?status=${statusFilter}`

      const response = await fetch(url, {
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar pagamentos')
      }
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar pagamentos'
      toast.error(errorMessage)
      console.error('Erro ao buscar pagamentos:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch('/api/members', {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Erro ao carregar membros')
      const data = await response.json()
      setAllMembers(data.members || [])
    } catch (error) {
      toast.error('Erro ao carregar membros')
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (createDialogOpen && allMembers.length === 0) {
      fetchMembers()
    }
  }, [createDialogOpen, allMembers.length, fetchMembers])

  const handleOpenDialog = () => {
    setCreateDialogOpen(true)
    setFormData({
      description: '',
      amount: '',
      planType: 'MONTHLY',
      dueDate: '',
    })
    setSelectedMembers([])
    setIncludeInactive(false)
    setIncludeAdmins(false)
  }

  const handleAddMember = (member: Member) => {
    if (!selectedMembers.find((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member])
    }
    setComboboxOpen(false)
  }

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId))
  }

  const getAvailableMembers = () => {
    return allMembers.filter((member) => !selectedMembers.find((sm) => sm.id === member.id))
  }

  const handleCreateCharges = async () => {
    try {
      // Validações
      if (!formData.description || !formData.amount || !formData.dueDate) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      // Determinar destinatários
      let targetMembers = selectedMembers

      if (targetMembers.length === 0) {
        // Se nenhum membro foi selecionado manualmente, usar filtros
        targetMembers = allMembers.filter((member) => {
          if (!member.isActive && !includeInactive) return false
          if (member.role === 'ADMIN' && !includeAdmins) return false
          return true
        })
      }

      if (targetMembers.length === 0) {
        toast.error('Nenhum membro selecionado para receber a cobrança')
        return
      }

      // Criar cobranças em lote
      const response = await fetch('/api/payments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          memberIds: targetMembers.map((m) => m.id),
          planType: formData.planType,
          amount: formData.amount,
          dueDate: formData.dueDate,
          description: formData.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar cobranças')
      }

      const result = await response.json()
      toast.success(`${result.count} cobrança(s) gerada(s) com sucesso`)
      setCreateDialogOpen(false)
      fetchPayments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar cobranças')
      console.error(error)
    }
  }

  const handleUpdateStatus = async (paymentId: string, status: Payment['status']) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          ...(status === 'PAID' && { paidAt: new Date().toISOString() }),
        }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      toast.success('Status atualizado com sucesso')
      fetchPayments()
    } catch (error) {
      toast.error('Erro ao atualizar status do pagamento')
      console.error(error)
    }
  }

  const getStatusBadge = (status: Payment['status']) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, label: 'Pendente' },
      PAID: { variant: 'default' as const, label: 'Pago' },
      OVERDUE: { variant: 'destructive' as const, label: 'Vencido' },
      CANCELLED: { variant: 'outline' as const, label: 'Cancelado' },
    }

    const config = variants[status]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPlanTypeLabel = (planType: string) => {
    const labels: Record<string, string> = {
      SINGLE: 'Única',
      MONTHLY: 'Mensal',
      QUARTERLY: 'Trimestral',
      ANNUAL: 'Anual',
    }
    return labels[planType] || planType
  }

  // Cálculos de estatísticas
  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter((p) => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0),
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Carregando pagamentos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Pagamentos</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie todos os pagamentos do grupo</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Gerar Cobrança
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">{payments.length} pagamento(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebido</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.paid.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === 'PAID').length} pago(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === 'PENDING').length} pendente(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === 'OVERDUE').length} vencido(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todos os Pagamentos</CardTitle>
              <CardDescription>Lista completa de pagamentos do grupo</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="PAID">Pagos</SelectItem>
                <SelectItem value="OVERDUE">Vencidos</SelectItem>
                <SelectItem value="CANCELLED">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Nenhum pagamento encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.member.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs text-sm">
                          {payment.notes || <span className="text-muted-foreground">-</span>}
                        </div>
                      </TableCell>
                      <TableCell>{getPlanTypeLabel(payment.membership.planType)}</TableCell>
                      <TableCell className="font-medium">
                        {payment.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {payment.paidAt ? (
                          <div className="text-sm">
                            {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                            {payment.paymentMethod && (
                              <div className="text-xs text-muted-foreground">
                                {payment.paymentMethod}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.status !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(payment.id, 'PAID')}
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Gerar Cobrança */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Nova Cobrança</DialogTitle>
            <DialogDescription>
              Crie uma cobrança para membros do grupo. Por padrão, será gerada apenas para membros
              ativos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Ex: Mensalidade referente ao mês de Novembro"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Tipo e Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planType">Tipo de Cobrança *</Label>
                <Select
                  value={formData.planType}
                  onValueChange={(value: typeof formData.planType) =>
                    setFormData({ ...formData, planType: value })
                  }
                >
                  <SelectTrigger id="planType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Única</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                    <SelectItem value="ANNUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            {/* Data de Vencimento */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            {/* Opções de Destinatários */}
            <div className="space-y-3 border-t pt-4">
              <Label>Destinatários</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInactive"
                  checked={includeInactive}
                  onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
                  disabled={selectedMembers.length > 0}
                />
                <Label htmlFor="includeInactive" className="text-sm font-normal cursor-pointer">
                  Gerar para membros inativos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAdmins"
                  checked={includeAdmins}
                  onCheckedChange={(checked) => setIncludeAdmins(checked as boolean)}
                  disabled={selectedMembers.length > 0}
                />
                <Label htmlFor="includeAdmins" className="text-sm font-normal cursor-pointer">
                  Gerar para administradores
                </Label>
              </div>
            </div>

            {/* Seletor de Membros Específicos */}
            <div className="space-y-3 border-t pt-4">
              <Label>Escolher membros destino (opcional)</Label>
              <p className="text-sm text-muted-foreground">
                Se você selecionar membros específicos, as opções acima serão ignoradas.
              </p>

              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                  >
                    Adicionar membro...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar membro..." />
                    <CommandList>
                      <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                      <CommandGroup>
                        {getAvailableMembers().map((member) => (
                          <CommandItem
                            key={member.id}
                            value={member.id}
                            onSelect={() => handleAddMember(member)}
                          >
                            <Check className={cn('mr-2 h-4 w-4', 'opacity-0')} />
                            <div className="flex flex-col">
                              <span>{member.name}</span>
                              <span className="text-xs text-muted-foreground">{member.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Lista de Membros Selecionados */}
              {selectedMembers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Destinatários selecionados ({selectedMembers.length})
                  </Label>
                  <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{member.name}</span>
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCharges}>Gerar Cobrança</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
