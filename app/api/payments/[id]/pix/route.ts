import { type NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { handleApiError } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/payments/:id/pix
 * Gera QR Code PIX para pagamento
 */
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await context.params

    // Buscar pagamento
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        member: true,
        membership: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Verificar permissão
    if (user.role !== 'ADMIN' && payment.memberId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se já foi pago
    if (payment.status === 'PAID') {
      return NextResponse.json({ error: 'Este pagamento já foi efetuado' }, { status: 400 })
    }

    // Gerar payload PIX (formato simplificado para demonstração)
    // Em produção, usaria uma biblioteca como pix-utils ou API do banco
    const pixPayload = generatePixPayload({
      merchantName: 'GRUPO NETWORKING',
      merchantCity: 'SAO PAULO',
      pixKey: 'contato@networking.com', // Chave PIX do grupo
      amount: payment.amount,
      transactionId: payment.id,
      description: `Mensalidade ${payment.membership.planType}`,
    })

    // Gerar QR Code
    const qrCodeDataURL = await QRCode.toDataURL(pixPayload)

    return NextResponse.json({
      pixPayload,
      qrCode: qrCodeDataURL,
      amount: payment.amount,
      dueDate: payment.dueDate,
      transactionId: payment.id,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Gera payload PIX estático (BR Code)
 * Formato simplificado para demonstração
 */
function generatePixPayload({
  merchantName,
  merchantCity,
  pixKey,
  amount,
  transactionId,
  description,
}: {
  merchantName: string
  merchantCity: string
  pixKey: string
  amount: number
  transactionId: string
  description: string
}): string {
  // Em produção, usar biblioteca como pix-utils para gerar payload completo
  // Aqui vamos usar um formato simplificado para demonstração

  const payload = [
    '00020126', // Payload Format Indicator
    '580014br.gov.bcb.pix', // Merchant Account Information
    `0114${pixKey}`, // PIX Key
    `5204${merchantName}`, // Merchant Name
    `5303986`, // Currency (BRL = 986)
    `5405${amount.toFixed(2)}`, // Amount
    `5802BR`, // Country Code
    `5913${merchantCity}`, // Merchant City
    `6207${description}`, // Additional Info
    `62070503***${transactionId.slice(-8)}`, // Reference Label
    '6304', // CRC16
  ].join('')

  return payload
}
