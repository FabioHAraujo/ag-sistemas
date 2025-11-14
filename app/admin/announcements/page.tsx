import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAnnouncementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Avisos</h1>
        <p className="text-gray-600 mt-2">Crie e gerencie comunicados para os membros</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade está sendo implementada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Em breve você poderá:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
            <li>Criar novos avisos e comunicados</li>
            <li>Definir prioridade e público-alvo</li>
            <li>Agendar publicações</li>
            <li>Editar e remover avisos existentes</li>
            <li>Ver estatísticas de visualização</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
