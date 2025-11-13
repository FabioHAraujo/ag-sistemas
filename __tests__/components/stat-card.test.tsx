/**
 * Testes de Componente: StatCard
 */

import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/dashboard/stat-card'

describe('StatCard Component', () => {
  it('deve renderizar título e valor', () => {
    render(<StatCard title="Total de Membros" value={42} />)

    expect(screen.getByText('Total de Membros')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('deve renderizar descrição quando fornecida', () => {
    render(<StatCard title="Membros" value={42} description="38 ativos" />)

    expect(screen.getByText('38 ativos')).toBeInTheDocument()
  })

  it('deve renderizar valor como string', () => {
    render(<StatCard title="Receita" value="R$ 1.234,56" />)

    expect(screen.getByText('R$ 1.234,56')).toBeInTheDocument()
  })

  it('deve renderizar tendência positiva', () => {
    render(
      <StatCard title="Indicações" value={127} trend={{ value: 12, label: 'vs mês anterior' }} />
    )

    expect(screen.getByText(/↑ 12%/)).toBeInTheDocument()
    expect(screen.getByText('vs mês anterior')).toBeInTheDocument()
  })

  it('deve renderizar tendência negativa', () => {
    render(
      <StatCard title="Indicações" value={100} trend={{ value: -5, label: 'vs mês anterior' }} />
    )

    expect(screen.getByText(/↓ 5%/)).toBeInTheDocument()
  })

  it('deve aplicar classe verde para tendência positiva', () => {
    render(<StatCard title="Test" value={100} trend={{ value: 10, label: 'test' }} />)

    const trendElement = screen.getByText(/↑ 10%/)
    expect(trendElement).toHaveClass('text-green-600')
  })

  it('deve aplicar classe vermelha para tendência negativa', () => {
    render(<StatCard title="Test" value={100} trend={{ value: -10, label: 'test' }} />)

    const trendElement = screen.getByText(/↓ 10%/)
    expect(trendElement).toHaveClass('text-red-600')
  })

  it('deve renderizar sem tendência quando não fornecida', () => {
    render(<StatCard title="Test" value={100} />)

    expect(screen.queryByText(/↑/)).not.toBeInTheDocument()
    expect(screen.queryByText(/↓/)).not.toBeInTheDocument()
  })
})
