'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
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
    { name: '1-a-1', href: '/admin/one-on-ones' },
    { name: 'Membros', href: '/admin/members' },
    { name: 'Financeiro', href: '/admin/payments' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="mr-4 flex">
            <Link href="/admin/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Admin</span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                {navigation.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          pathname === item.href && 'bg-accent'
                        )}
                      >
                        {item.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
