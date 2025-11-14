'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ReferralsByStatusProps {
  data: Array<{
    status: string
    count: number
    value: number
  }>
}

const COLORS = {
  SENT: '#3b82f6',
  CONTACTED: '#8b5cf6',
  NEGOTIATING: '#f59e0b',
  CLOSED_WON: '#10b981',
  CLOSED_LOST: '#ef4444',
}

const STATUS_LABELS = {
  SENT: 'Enviada',
  CONTACTED: 'Contatada',
  NEGOTIATING: 'Negociando',
  CLOSED_WON: 'Fechada',
  CLOSED_LOST: 'Perdida',
}

export function ReferralsByStatus({ data }: ReferralsByStatusProps) {
  const chartData = data.map((item) => ({
    ...item,
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    fill: COLORS[item.status as keyof typeof COLORS] || '#888888',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicações por Status</CardTitle>
        <CardDescription>Distribuição das indicações de negócios</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.payload.name}: ${entry.payload.count}`}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`${value} indicações`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface MonthlyTrendProps {
  data: Array<{
    month: string
    sent: number
    closed: number
    value: number
  }>
}

export function MonthlyReferralTrend({ data }: MonthlyTrendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência Mensal de Indicações</CardTitle>
        <CardDescription>Indicações enviadas vs. fechadas por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => [
                value,
                name === 'sent' ? 'Enviadas' : 'Fechadas',
              ]}
            />
            <Legend formatter={(value) => (value === 'sent' ? 'Enviadas' : 'Fechadas')} />
            <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TopSendersProps {
  data: Array<{
    name: string
    count: number
    closedValue: number
  }>
}

export function TopReferralSenders({ data }: TopSendersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Indicadores</CardTitle>
        <CardDescription>Membros que mais enviam indicações</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'count'
                  ? `${value} indicações`
                  : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                name === 'count' ? 'Total' : 'Valor Fechado',
              ]}
            />
            <Legend
              formatter={(value) => (value === 'count' ? 'Indicações' : 'Valor Fechado (R$)')}
            />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface AttendanceTrendProps {
  data: Array<{
    month: string
    total: number
    present: number
    rate: number
  }>
}

export function AttendanceTrend({ data }: AttendanceTrendProps) {
  const chartData = data.map((item) => ({
    ...item,
    ratePercent: Math.round(item.rate * 100),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Presença Mensal</CardTitle>
        <CardDescription>Acompanhamento de participação nas reuniões</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'present' ? `${value} membros` : `${value}%`,
                name === 'present' ? 'Presentes' : 'Taxa',
              ]}
            />
            <Legend
              formatter={(value) => (value === 'present' ? 'Presentes' : 'Taxa de Presença (%)')}
            />
            <Bar dataKey="present" fill="#10b981" />
            <Bar dataKey="ratePercent" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
