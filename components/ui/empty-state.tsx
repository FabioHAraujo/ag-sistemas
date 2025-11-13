'use client'

import { FileQuestion, Inbox, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  title: string
  description: string
  icon?: 'inbox' | 'search' | 'users' | 'file'
  action?: {
    label: string
    onClick: () => void
  }
}

const icons = {
  inbox: Inbox,
  search: Search,
  users: Users,
  file: FileQuestion,
}

export function EmptyState({ title, description, icon = 'inbox', action }: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-sm">{description}</p>
        {action && (
          <Button onClick={action.onClick} variant="default">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
