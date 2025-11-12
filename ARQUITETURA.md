# Arquitetura da Plataforma de Gestão para Grupos de Networking

## Sumário

1. [Visão Geral](#visão-geral)
2. [Diagrama da Arquitetura](#diagrama-da-arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)

---

## Visão Geral

Esta plataforma foi projetada para digitalizar a gestão de grupos de networking, substituindo planilhas e controles manuais por um sistema centralizado. A arquitetura adota uma abordagem fullstack moderna utilizando Next.js, que combina SSR (Server-Side Rendering), CSR (Client-Side Rendering) e API Routes em um único framework.

### Princípios Arquiteturais

- **Monolito Modular**: Aplicação Next.js única com separação clara de responsabilidades
- **API-First**: Endpoints REST bem definidos para todas as operações
- **Component-Driven**: Interface construída com componentes React reutilizáveis
- **Type-Safe**: TypeScript em toda a aplicação
- **Database-Agnostic**: Drizzle ORM para facilitar migração entre bancos de dados

---

## Diagrama da Arquitetura

![Diagrama de Arquitetura](./docs/esquema-mermaid.svg)

### Fluxo de Dados Simplificado

![Fluxo de Dados](./docs/fluxo-de-dados.svg)

## Stack Tecnológica

### 🖥️ **Frontend**

| Tecnologia          | Resumo                                                                                                          | Justificativa                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16+ & React 19+**     | Framework React com suporte a SSR (Server-Side Rendering), SSG (Static Site Generation) e rotas de API nativas. | Permite criar aplicações fullstack performáticas e escaláveis, com renderização híbrida e excelente integração com React. |
| **TypeScript**      | Superset do JavaScript com tipagem estática.                                                                    | Permite uso de tipagem, aumentando a segurança e confiabilidade do código. |                               
| **Shadcn/ui com TailwindCSS 4+**       | Biblioteca de componentes acessíveis e personalizáveis.                                                         | Fornece UI consistente e moderna, permitindo um Design System melhorado e maior agilidade para estilização com o TailwindCSS.                                    |
| **React Hook Form** | Gerenciador de formulários baseado em hooks.                                                                    | Melhora a performance e reduz re-renderizações, integrando-se facilmente a libs como Zod.                                 |
| **Zod**             | Biblioteca de validação de schemas e tipagem runtime.                                                           | Garante integridade de dados e validação alinhada com os tipos TypeScript.                                                |

---