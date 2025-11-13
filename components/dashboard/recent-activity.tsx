import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Activity {
  type: string
  description: string
  timestamp: string
}

interface RecentActivityProps {
  activities: Activity[]
}

const ACTIVITY_TYPES = {
  referral: { label: 'Indicação', color: 'bg-blue-500' },
  thank_you: { label: 'Agradecimento', color: 'bg-green-500' },
  meeting: { label: 'Reunião', color: 'bg-purple-500' },
  application: { label: 'Candidatura', color: 'bg-orange-500' },
  payment: { label: 'Pagamento', color: 'bg-emerald-500' },
  other: { label: 'Outro', color: 'bg-gray-500' },
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
    }
    if (diffInHours < 24) {
      return `há ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
    }
    const diffInDays = Math.floor(diffInHours / 24)
    return `há ${diffInDays} dia${diffInDays !== 1 ? 's' : ''}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const typeInfo =
              ACTIVITY_TYPES[activity.type as keyof typeof ACTIVITY_TYPES] || ACTIVITY_TYPES.other

            return (
              <div
                key={`${activity.timestamp}-${activity.type}`}
                className="flex items-start gap-4"
              >
                <div className={`w-2 h-2 rounded-full ${typeInfo.color} mt-2`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {typeInfo.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{activity.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
