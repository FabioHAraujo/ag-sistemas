'use client'

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  QrCode,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Payment = {
  id: string
  amount: number
  dueDate: string
  paidAt: string | null
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  paymentMethod: string | null
  transactionId: string | null
  notes: string | null
  membership: {
    id: string
    planType: string
  }
}

type PixData = {
  pixPayload: string
  qrCode: string
  amount: number
  dueDate: string
  transactionId: string
}

export default function MemberPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [showPixDialog, setShowPixDialog] = useState(false)
  const [generatingPix, setGeneratingPix] = useState(false)

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/payments', {
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
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleGeneratePix = async (payment: Payment) => {
    setGeneratingPix(true)
    setSelectedPayment(payment)

    try {
      const response = await fetch(`/api/payments/${payment.id}/pix`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar PIX')
      }

      const data = await response.json()
      setPixData(data)
      setShowPixDialog(true)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar código PIX'
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setGeneratingPix(false)
    }
  }

  const handleCopyPixCode = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixPayload)
      toast.success('Código PIX copiado!')
    }
  }

  const handleSimulatePayment = async () => {
    if (!selectedPayment) return

    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'PAID',
          paidAt: new Date().toISOString(),
          paymentMethod: 'PIX',
          transactionId: `PIX-${Date.now()}`,
        }),
      })

      if (!response.ok) throw new Error('Erro ao processar pagamento')

      toast.success('Pagamento confirmado com sucesso!')
      setShowPixDialog(false)
      fetchPayments()
    } catch (error) {
      toast.error('Erro ao confirmar pagamento')
      console.error(error)
    }
  }

  const getStatusBadge = (status: Payment['status']) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, icon: Clock, label: 'Pendente' },
      PAID: { variant: 'default' as const, icon: CheckCircle2, label: 'Pago' },
      OVERDUE: { variant: 'destructive' as const, icon: AlertCircle, label: 'Vencido' },
      CANCELLED: { variant: 'outline' as const, icon: XCircle, label: 'Cancelado' },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
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

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Carregando pagamentos...</div>
      </div>
    )
  }

  const pendingPayments = payments.filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE')
  const paidPayments = payments.filter((p) => p.status === 'PAID')

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meus Pagamentos</h1>
        <p className="text-muted-foreground">Gerencie suas mensalidades e pagamentos</p>
      </div>

      {/* Pagamentos Pendentes */}
      {pendingPayments.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Pagamentos Pendentes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingPayments.map((payment) => (
              <Card
                key={payment.id}
                className={payment.status === 'OVERDUE' ? 'border-destructive' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {payment.notes ||
                          `Mensalidade ${getPlanTypeLabel(payment.membership.planType)}`}
                      </CardTitle>
                      <CardDescription>
                        Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <DollarSign className="h-6 w-6 text-muted-foreground" />
                    {payment.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleGeneratePix(payment)}
                    disabled={generatingPix}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {generatingPix ? 'Gerando...' : 'Pagar com PIX'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Pagamentos */}
      {paidPayments.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
          <div className="grid gap-4">
            {paidPayments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">
                          {payment.notes ||
                            `Mensalidade ${getPlanTypeLabel(payment.membership.planType)}`}
                        </CardTitle>
                        {getStatusBadge(payment.status)}
                      </div>
                      <CardDescription className="mt-1">
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Venc: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                          {payment.paidAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Pago em: {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {payment.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                      {payment.paymentMethod && (
                        <div className="text-xs text-muted-foreground">{payment.paymentMethod}</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 && (
        <Card>
          <CardContent className="flex h-[200px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <CreditCard className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Nenhum pagamento encontrado</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog PIX */}
      <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie o código PIX para efetuar o pagamento
            </DialogDescription>
          </DialogHeader>

          {pixData && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center rounded-lg border bg-white p-4">
                {/* biome-ignore lint/performance/noImgElement: QR Code data URL from canvas */}
                <img src={pixData.qrCode} alt="QR Code PIX" className="h-64 w-64" />
              </div>

              {/* Valor */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Valor</div>
                <div className="text-3xl font-bold">
                  {pixData.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
              </div>

              {/* Código PIX */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Código PIX Copia e Cola</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pixData.pixPayload}
                    readOnly
                    className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={handleCopyPixCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Botão Simulação */}
              <div className="rounded-lg border-2 border-dashed bg-muted/50 p-4">
                <div className="mb-3 text-center text-sm font-medium text-muted-foreground">
                  🎭 Modo Demonstração
                </div>
                <Button className="w-full" variant="default" onClick={handleSimulatePayment}>
                  Simular Pagamento Aprovado
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Clique para simular que o pagamento foi efetuado
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
