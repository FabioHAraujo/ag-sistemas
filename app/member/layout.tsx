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

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const navigation = [
    { name: 'Avisos', href: '/member/announcements' },
    { name: 'Reuniões', href: '/member/meetings' },
    { name: '1-a-1', href: '/member/one-on-ones' },
    { name: 'Indicações', href: '/member/referrals' },
    { name: 'Pagamentos', href: '/member/payments' },
    { name: 'Membros', href: '/member/members' },
    { name: 'Perfil', href: '/member/profile' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="mr-4 flex">
            <Link href="/member/announcements" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Networking</span>
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
