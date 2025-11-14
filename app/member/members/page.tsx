import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MembersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Membros</h1>
        <p className="text-gray-600 mt-2">Conheça os membros do grupo de networking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade está sendo implementada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Em breve você poderá:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
            <li>Ver lista completa de membros ativos</li>
            <li>Visualizar perfis detalhados</li>
            <li>Filtrar por área de atuação</li>
            <li>Agendar reuniões 1-a-1</li>
            <li>Ver histórico de indicações entre membros</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
