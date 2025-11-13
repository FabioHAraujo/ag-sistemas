'use client'

import { useEffect, useState } from 'react'
import {
  AttendanceTrend,
  MonthlyReferralTrend,
  ReferralsByStatus,
  TopReferralSenders,
} from '@/components/dashboard/charts'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { RecentThankYous } from '@/components/dashboard/recent-thank-yous'
import { StatCard } from '@/components/dashboard/stat-card'

interface DashboardStats {
  overview: {
    totalMembers: number
    activeMembers: number
    pendingApplications: number
    totalReferrals: number
    closedReferrals: number
    totalRevenue: number
  }
  referrals: {
    byStatus: Array<{
      status: string
      count: number
      value: number
    }>
    monthlyTrend: Array<{
      month: string
      sent: number
      closed: number
      value: number
    }>
    topSenders: Array<{
      name: string
      count: number
      closedValue: number
    }>
  }
  meetings: {
    upcoming: number
    thisMonth: number
    averageAttendance: number
    attendanceRate: number
    monthlyAttendance: Array<{
      month: string
      total: number
      present: number
      rate: number
    }>
  }
  thankYous: {
    total: number
    thisMonth: number
    recent: Array<{
      from: string
      to: string
      message: string
      value: number | null
      createdAt: string
    }>
  }
  payments: {
    totalExpected: number
    totalReceived: number
    pending: number
    overdue: number
    byStatus: Array<{
      status: string
      count: number
      amount: number
    }>
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('Erro ao carregar estatísticas')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Erro: {error || 'Dados não disponíveis'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do grupo de networking</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Membros"
          value={stats.overview.totalMembers}
          description={`${stats.overview.activeMembers} ativos`}
        />
        <StatCard
          title="Candidaturas Pendentes"
          value={stats.overview.pendingApplications}
          description="Aguardando revisão"
        />
        <StatCard
          title="Indicações Totais"
          value={stats.overview.totalReferrals}
          description={`${stats.overview.closedReferrals} fechadas`}
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${stats.overview.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Mensalidades do mês"
        />
      </div>

      {/* Referrals Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <ReferralsByStatus data={stats.referrals.byStatus} />
        <MonthlyReferralTrend data={stats.referrals.monthlyTrend} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TopReferralSenders data={stats.referrals.topSenders} />
        <AttendanceTrend data={stats.meetings.monthlyAttendance} />
      </div>

      {/* Meetings Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Próximas Reuniões"
          value={stats.meetings.upcoming}
          description="Agendadas"
        />
        <StatCard
          title="Reuniões Este Mês"
          value={stats.meetings.thisMonth}
          description="Realizadas e agendadas"
        />
        <StatCard
          title="Presença Média"
          value={`${Math.round(stats.meetings.attendanceRate * 100)}%`}
          description={`${stats.meetings.averageAttendance} membros por reunião`}
        />
      </div>

      {/* Payments Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Esperado"
          value={`R$ ${stats.payments.totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Total de mensalidades"
        />
        <StatCard
          title="Recebido"
          value={`R$ ${stats.payments.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Pagamentos confirmados"
        />
        <StatCard
          title="Pendente"
          value={`R$ ${stats.payments.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Aguardando pagamento"
        />
        <StatCard
          title="Atrasado"
          value={`R$ ${stats.payments.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Pagamentos vencidos"
        />
      </div>

      {/* Thank Yous Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total de Agradecimentos"
          value={stats.thankYous.total}
          description="Desde o início"
        />
        <StatCard
          title="Este Mês"
          value={stats.thankYous.thisMonth}
          description="Agradecimentos recentes"
        />
        <StatCard title="Meta Mensal" value="30" description="Objetivo: 30 agradecimentos" />
      </div>

      {/* Recent Activity and Thank Yous */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity activities={stats.recentActivity} />
        <RecentThankYous thankYous={stats.thankYous.recent} />
      </div>
    </div>
  )
}
