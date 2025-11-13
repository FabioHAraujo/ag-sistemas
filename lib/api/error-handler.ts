import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { ZodError, type ZodSchema } from 'zod'

/**
 * Classe de erro customizado para a aplicação
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Handler centralizado de erros para API Routes
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Erro de validação Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Dados inválidos',
        details: error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  // Erro customizado da aplicação
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Erro de constraint do Prisma (unique, foreign key, etc)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Registro duplicado',
          field: error.meta?.target,
        },
        { status: 409 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Registro não encontrado',
        },
        { status: 404 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Violação de chave estrangeira',
        },
        { status: 400 }
      )
    }
  }

  // Erro genérico
  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    },
    { status: 500 }
  )
}

/**
 * Wrapper para validar dados com Zod
 */
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw result.error
  }

  return result.data
}

/**
 * Helper para responses de sucesso padronizados
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Helper para response de criação
 */
export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 })
}

/**
 * Helper para response sem conteúdo
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
