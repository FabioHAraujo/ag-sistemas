/**
 * Testes de Componente: RecentActivity
 */

import { render, screen } from '@testing-library/react'
import { RecentActivity } from '@/components/dashboard/recent-activity'

describe('RecentActivity Component', () => {
  const mockActivities = [
    {
      type: 'referral',
      description: 'João Silva enviou indicação para Maria Santos',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
    },
    {
      type: 'thank_you',
      description: 'Carlos Oliveira agradeceu Ana Costa',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
    },
    {
      type: 'meeting',
      description: 'Reunião semanal concluída com 34 presentes',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
    },
  ]

  it('deve renderizar título', () => {
    render(<RecentActivity activities={mockActivities} />)

    expect(screen.getByText('Atividade Recente')).toBeInTheDocument()
  })

  it('deve renderizar todas as atividades', () => {
    render(<RecentActivity activities={mockActivities} />)

    expect(screen.getByText('João Silva enviou indicação para Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Carlos Oliveira agradeceu Ana Costa')).toBeInTheDocument()
    expect(screen.getByText('Reunião semanal concluída com 34 presentes')).toBeInTheDocument()
  })

  it('deve renderizar badges de tipo corretos', () => {
    render(<RecentActivity activities={mockActivities} />)

    expect(screen.getByText('Indicação')).toBeInTheDocument()
    expect(screen.getByText('Agradecimento')).toBeInTheDocument()
    expect(screen.getByText('Reunião')).toBeInTheDocument()
  })

  it('deve formatar timestamp relativo em minutos', () => {
    const activities = [
      {
        type: 'referral',
        description: 'Test',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ]

    render(<RecentActivity activities={activities} />)

    expect(screen.getByText(/há 30 minutos/)).toBeInTheDocument()
  })

  it('deve formatar timestamp relativo em horas', () => {
    const activities = [
      {
        type: 'referral',
        description: 'Test',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ]

    render(<RecentActivity activities={activities} />)

    expect(screen.getByText(/há 3 horas/)).toBeInTheDocument()
  })

  it('deve formatar timestamp relativo em dias', () => {
    const activities = [
      {
        type: 'referral',
        description: 'Test',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
    ]

    render(<RecentActivity activities={activities} />)

    expect(screen.getByText(/há 2 dias/)).toBeInTheDocument()
  })

  it('deve renderizar lista vazia sem erros', () => {
    const { container } = render(<RecentActivity activities={[]} />)

    expect(screen.getByText('Atividade Recente')).toBeInTheDocument()
    expect(container.querySelector('.space-y-4')).toBeInTheDocument()
  })

  it('deve usar tipo padrão para tipo desconhecido', () => {
    const activities = [
      {
        type: 'unknown_type',
        description: 'Atividade desconhecida',
        timestamp: new Date().toISOString(),
      },
    ]

    render(<RecentActivity activities={activities} />)

    // Deve renderizar sem erros, usando tipo padrão (referral)
    expect(screen.getByText('Atividade desconhecida')).toBeInTheDocument()
  })
})
