import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/stats
 * Retorna estatísticas mockadas do dashboard
 * Requer autenticação
 */
export async function GET() {
  try {
    // Verificar autenticação
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Dados mockados para o dashboard
    const stats = {
      overview: {
        totalMembers: 42,
        activeMembers: 38,
        pendingApplications: 5,
        totalReferrals: 127,
        closedReferrals: 89,
        totalRevenue: 45600.0,
      },
      referrals: {
        byStatus: [
          { status: 'SENT', count: 15, value: 12500.0 },
          { status: 'CONTACTED', count: 12, value: 18400.0 },
          { status: 'NEGOTIATING', count: 8, value: 24300.0 },
          { status: 'CLOSED_WON', count: 67, value: 187600.0 },
          { status: 'CLOSED_LOST', count: 22, value: 34200.0 },
        ],
        monthlyTrend: [
          { month: 'Jan', sent: 8, closed: 5, value: 12400.0 },
          { month: 'Fev', sent: 12, closed: 8, value: 18900.0 },
          { month: 'Mar', sent: 15, closed: 11, value: 24700.0 },
          { month: 'Abr', sent: 18, closed: 13, value: 31200.0 },
          { month: 'Mai', sent: 22, closed: 17, value: 38600.0 },
          { month: 'Jun', sent: 19, closed: 15, value: 42100.0 },
        ],
        topSenders: [
          { name: 'João Silva', count: 23, closedValue: 45800.0 },
          { name: 'Maria Santos', count: 19, closedValue: 38200.0 },
          { name: 'Carlos Oliveira', count: 17, closedValue: 32400.0 },
          { name: 'Ana Costa', count: 14, closedValue: 28100.0 },
          { name: 'Pedro Almeida', count: 12, closedValue: 21600.0 },
        ],
      },
      meetings: {
        upcoming: 3,
        thisMonth: 8,
        averageAttendance: 34,
        attendanceRate: 0.81, // 81%
        monthlyAttendance: [
          { month: 'Jan', total: 42, present: 36, rate: 0.86 },
          { month: 'Fev', total: 42, present: 34, rate: 0.81 },
          { month: 'Mar', total: 42, present: 38, rate: 0.9 },
          { month: 'Abr', total: 42, present: 33, rate: 0.79 },
          { month: 'Mai', total: 42, present: 35, rate: 0.83 },
          { month: 'Jun', total: 42, present: 34, rate: 0.81 },
        ],
      },
      thankYous: {
        total: 156,
        thisMonth: 23,
        recent: [
          {
            from: 'João Silva',
            to: 'Maria Santos',
            message: 'Obrigado pela indicação que fechou R$ 15.000!',
            value: 15000.0,
            createdAt: new Date('2024-06-10').toISOString(),
          },
          {
            from: 'Carlos Oliveira',
            to: 'Ana Costa',
            message: 'Excelente contato, negócio fechado!',
            value: 8500.0,
            createdAt: new Date('2024-06-09').toISOString(),
          },
          {
            from: 'Pedro Almeida',
            to: 'João Silva',
            message: 'Muito obrigado pela ajuda no networking.',
            value: null,
            createdAt: new Date('2024-06-08').toISOString(),
          },
        ],
      },
      payments: {
        totalExpected: 4200.0,
        totalReceived: 3800.0,
        pending: 400.0,
        overdue: 200.0,
        byStatus: [
          { status: 'PAID', count: 38, amount: 3800.0 },
          { status: 'PENDING', count: 2, amount: 200.0 },
          { status: 'OVERDUE', count: 2, amount: 200.0 },
        ],
      },
      recentActivity: [
        {
          type: 'referral',
          description: 'João Silva enviou indicação para Maria Santos',
          timestamp: new Date('2024-06-11T14:30:00').toISOString(),
        },
        {
          type: 'thank_you',
          description: 'Carlos Oliveira agradeceu Ana Costa',
          timestamp: new Date('2024-06-11T10:15:00').toISOString(),
        },
        {
          type: 'meeting',
          description: 'Reunião semanal concluída com 34 presentes',
          timestamp: new Date('2024-06-10T19:00:00').toISOString(),
        },
        {
          type: 'application',
          description: 'Nova intenção de participação recebida',
          timestamp: new Date('2024-06-10T16:45:00').toISOString(),
        },
        {
          type: 'payment',
          description: 'Pagamento de R$ 100,00 confirmado - Pedro Almeida',
          timestamp: new Date('2024-06-10T11:20:00').toISOString(),
        },
      ],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
