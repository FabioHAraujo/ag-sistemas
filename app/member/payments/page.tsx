'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
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
  membership: {
    id: string
    planType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
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

const planTypeLabels = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
}

export default function MemberPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/payments', {
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
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter((p) => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0),
  }

  const activeMembership = payments.find((p) => p.membership.status === 'ACTIVE')?.membership

  if (loading) {
    return <LoadingState message="Carregando pagamentos..." />
  }

  return (
    <div className="container mx-auto py-10">
      {/* Status da Mensalidade */}
      {activeMembership && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status da Mensalidade</CardTitle>
            <CardDescription>Informações do seu plano atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-500">Plano</p>
                <p className="text-lg font-semibold">{planTypeLabels[activeMembership.planType]}</p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.paid.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pending.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Seus pagamentos e mensalidades</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              title="Nenhum pagamento encontrado"
              description="Você ainda não possui pagamentos registrados"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">
                      {payment.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>{planTypeLabels[payment.membership.planType]}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[payment.status]}>
                        {statusLabels[payment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>{payment.paymentMethod || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
