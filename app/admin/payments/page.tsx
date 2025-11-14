import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPaymentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
        <p className="text-gray-600 mt-2">Controle mensalidades e pagamentos dos membros</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade está sendo implementada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Em breve você poderá:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
            <li>Ver todos os pagamentos (pendentes, pagos, atrasados)</li>
            <li>Registrar novos pagamentos manualmente</li>
            <li>Gerar cobranças mensais automaticamente</li>
            <li>Exportar relatórios financeiros</li>
            <li>Enviar lembretes de pagamento</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
