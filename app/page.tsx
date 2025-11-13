import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Grupo de Networking</CardTitle>
          <CardDescription className="text-lg">
            Plataforma de gestão para grupos de networking empresarial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Bem-vindo à plataforma de gestão do grupo de networking. Aqui você pode gerenciar
              membros, indicações, reuniões e muito mais.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/login">Fazer Login</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/apply">Quero Participar</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/50 p-6">
            <h3 className="font-semibold">Funcionalidades</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Gestão de membros e candidaturas</li>
              <li>✓ Sistema de indicações de negócios</li>
              <li>✓ Controle de presença em reuniões</li>
              <li>✓ Dashboard com estatísticas</li>
              <li>✓ Sistema de agradecimentos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
