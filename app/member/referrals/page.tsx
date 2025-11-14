import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReferralsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Indicações de Negócios</h1>
        <p className="text-gray-600 mt-2">Gerencie suas indicações enviadas e recebidas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade está sendo implementada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Em breve você poderá:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
            <li>Criar indicações de negócios para outros membros</li>
            <li>Ver indicações que você enviou</li>
            <li>Ver indicações que você recebeu</li>
            <li>Acompanhar o status de cada indicação</li>
            <li>Registrar agradecimentos por negócios fechados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
