'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Aguarda um pouco para garantir que o cookie foi removido
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Limpa qualquer cache do Next.js
        if ('caches' in window) {
          const cacheNames = await window.caches.keys()
          await Promise.all(cacheNames.map((name) => window.caches.delete(name)))
        }

        // Redireciona e força reload completo
        window.location.replace('/login')
      } else {
        console.error('Logout failed:', await response.text())
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Mesmo com erro, tenta redirecionar
      window.location.replace('/login')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Candidaturas', href: '/admin/applications' },
    { name: 'Avisos', href: '/admin/announcements' },
    { name: 'Reuniões', href: '/admin/meetings' },
    { name: 'Reuniões 1-a-1', href: '/admin/one-on-ones' },
    { name: 'Membros', href: '/admin/members' },
    { name: 'Financeiro', href: '/admin/payments' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
                Networking Admin
              </Link>
              <div className="flex gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-700 hover:text-gray-900'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
