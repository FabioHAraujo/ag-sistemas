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

interface Payment {
  id: string
  amount: number
  dueDate: string
  paidAt: string | null
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  paymentMethod: string | null
  member: {
    id: string
    name: string
    email: string
  }
  membership: {
    id: string
    planType: string
    status: string
  }
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
  CANCELLED: 'Cancelado',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [generateMonth, setGenerateMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, '0')
  )
  const [generateYear, setGenerateYear] = useState<string>(String(new Date().getFullYear()))

  const [paymentMethod, setPaymentMethod] = useState('')

  const fetchPayments = useCallback(async () => {
    try {
      const url = filterStatus === 'all' ? '/api/payments' : `/api/payments?status=${filterStatus}`

      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar pagamentos')
      }

      const data = await response.json()
      setPayments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar pagamentos')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleMarkAsPaid = async (payment: Payment) => {
    if (!paymentMethod && payment.status === 'PENDING') {
      setSelectedPayment(payment)
      setDialogOpen(true)
      return
    }

    setActionLoading(true)

    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'PAID',
          paidAt: new Date().toISOString(),
          paymentMethod: paymentMethod || 'Não especificado',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao marcar pagamento como pago')
      }

      toast.success('Pagamento marcado como pago')
      setDialogOpen(false)
      setPaymentMethod('')
      setSelectedPayment(null)
      fetchPayments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar pagamento')
    } finally {
      setActionLoading(false)
    }
  }

  const handleGenerateCharges = async () => {
    setActionLoading(true)

    try {
      const response = await fetch('/api/payments/generate-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          month: parseInt(generateMonth),
          year: parseInt(generateYear),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar cobranças')
      }

      const data = await response.json()
      toast.success(data.message)
      setGenerateDialogOpen(false)
      fetchPayments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar cobranças')
    } finally {
      setActionLoading(false)
    }
  }

  // Calcular estatísticas
  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter((p) => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0),
  }

  if (loading) {
    return <LoadingState message="Carregando pagamentos..." />
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">
              R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pago</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              R$ {stats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendente</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              R$ {stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Atrasado</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              R$ {stats.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabela de Pagamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestão de Pagamentos</CardTitle>
            <CardDescription>Controle de mensalidades e pagamentos dos membros</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="PAID">Pagos</SelectItem>
                <SelectItem value="OVERDUE">Atrasados</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setGenerateDialogOpen(true)}>Gerar Cobranças</Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              title="Nenhum pagamento encontrado"
              description="Gere cobranças mensais ou ajuste os filtros"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.member.name}</TableCell>
                    <TableCell>{payment.membership.planType}</TableCell>
                    <TableCell>
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[payment.status]}>
                        {statusLabels[payment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.paymentMethod || '-'}</TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'PENDING' || payment.status === 'OVERDUE' ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(payment)}
                          disabled={actionLoading}
                        >
                          Marcar como Pago
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Marcar como Pago */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Confirme o pagamento de {selectedPayment?.member.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Valor</Label>
              <Input
                value={`R$ ${selectedPayment?.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Transferência">Transferência Bancária</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedPayment && handleMarkAsPaid(selectedPayment)}
              disabled={actionLoading || !paymentMethod}
            >
              {actionLoading ? 'Salvando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Gerar Cobranças */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Cobranças Mensais</DialogTitle>
            <DialogDescription>
              Gera automaticamente cobranças para todas as associações ativas
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Mês</Label>
                <Select value={generateMonth} onValueChange={setGenerateMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={String(month).padStart(2, '0')}>
                        {new Date(2000, month - 1).toLocaleDateString('pt-BR', {
                          month: 'long',
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  value={generateYear}
                  onChange={(e) => setGenerateYear(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateCharges} disabled={actionLoading}>
              {actionLoading ? 'Gerando...' : 'Gerar Cobranças'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
