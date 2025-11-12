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

### ⚙️ **Backend**

| Tecnologia             | Resumo                                        | Justificativa                                                                                           |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Next.js API Routes** | Rotas de API integradas ao framework Next.js. | Permite implementar endpoints REST diretamente no mesmo projeto, simplificando o deploy e a integração. |
| **Drizzle ORM**        | ORM moderno “TypeScript-first”.               | Oferece tipagem completa, migrações seguras e performance elevada, mantendo controle direto sobre SQL, além de oferecer melhor desempenho em consultas quando comparado com o Prisma ORM. |
| **SQLite**             | Banco de dados relacional leve.               | Uso para a prototipagem deste Teste Técnico, o próprio Drizzle está sendo integrado à este para fácil migração para bancos relacionais mais recomendados, como PostgreSQL ou MySQL/MariaDB.                |
| **JWT (jsonwebtoken)** | Implementação de autenticação stateless.      | Facilita a autenticação distribuída, dispensando sessão persistente no servidor.                        |
| **bcrypt**             | Biblioteca para hash e verificação de senhas. | Garante segurança ao armazenar senhas de forma criptograficamente segura.                              

---

### 🧪 **Testes**

| Tecnologia                    | Resumo                                                   | Justificativa                                                              |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Jest**                      | Framework completo de testes para JavaScript/TypeScript. | Fornece ambiente unificado para testes unitários e de integração.          |
| **React Testing Library**     | Utilitário para testes de componentes React.             | Foca no comportamento do usuário final, com testes de render e user actions. |
| **MSW (Mock Service Worker)** | Mock de requisições HTTP e interceptador de APIs.        | Permite testar o frontend sem depender de um backend real.                 |
| **Supertest**                 | Biblioteca para testar endpoints HTTP.                   | Ideal para validar APIs criadas com Next.js ou Express.                    |

---

### 🛠️ **Ferramentas**

| Tecnologia      | Resumo                                              | Justificativa                                                                          |
| --------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Biome**       | Linter e formatador all-in-one ultrarrápido (escrito em Rust). | Substitui ESLint + Prettier com performance superior (até 25x mais rápido), configuração zero/mínima e menor footprint de dependências. Suporta JavaScript, TypeScript, JSON e JSX/TSX. |
| **Husky**       | Executor de Git hooks.                              | Automatiza checagens antes de commits/push, prevenindo código quebrado no repositório. |
| **Lint-staged** | Executa validações apenas nos arquivos modificados. | Otimiza o tempo de execução dos hooks, focando apenas em códigos alterados, tornando o fluxo de commits mais ágil.          |

---