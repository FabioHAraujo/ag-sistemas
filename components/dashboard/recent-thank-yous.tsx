import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ThankYou {
  from: string
  to: string
  message: string
  value: number | null
  createdAt: string
}

interface RecentThankYousProps {
  thankYous: ThankYou[]
}

export function RecentThankYous({ thankYous }: RecentThankYousProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agradecimentos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {thankYous.map((thankYou) => (
            <div
              key={`${thankYou.createdAt}-${thankYou.from}`}
              className="border-l-2 border-green-500 pl-4 py-2"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">
                    {thankYou.from} → {thankYou.to}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(thankYou.createdAt)}</p>
                </div>
                {thankYou.value && (
                  <span className="text-sm font-semibold text-green-600">
                    R$ {thankYou.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground italic">"{thankYou.message}"</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
