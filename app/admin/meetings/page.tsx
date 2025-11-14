import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminMeetingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Reuniões</h1>
        <p className="text-gray-600 mt-2">Agende reuniões e controle presenças</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade está sendo implementada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Em breve você poderá:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
            <li>Criar e agendar reuniões do grupo</li>
            <li>Definir local e tipo de reunião</li>
            <li>Gerenciar lista de presenças</li>
            <li>Ver histórico de reuniões</li>
            <li>Exportar relatórios de frequência</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
