import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminMembersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Membros</h1>
        <p className="text-gray-600 mt-2">Gerencie membros ativos, inativos e suspensos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade está sendo implementada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Em breve você poderá:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
            <li>Ver lista completa de membros com filtros</li>
            <li>Editar perfis de membros</li>
            <li>Ativar, desativar ou suspender contas</li>
            <li>Ver estatísticas individuais de cada membro</li>
            <li>Exportar dados para relatórios</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
