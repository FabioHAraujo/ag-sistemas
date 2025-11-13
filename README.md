# 🚀 Plataforma de Gestão para Grupos de Networking

> Plataforma fullstack moderna para digitalizar e otimizar a gestão de grupos de networking, substituindo planilhas e controles manuais por um sistema centralizado e eficiente.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest)](https://jestjs.io/)

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Testes](#-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Documentação](#-documentação)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

Esta plataforma foi desenvolvida como solução para grupos de networking focados em geração de negócios, oferecendo um sistema completo para gestão de membros, indicações, reuniões e métricas de performance.

### Contexto

Grupos de networking tradicionalmente utilizam planilhas e controles manuais para gerenciar suas operações. Esta plataforma centraliza todas essas funcionalidades em um sistema moderno, seguro e escalável.

### Objetivos

- ✅ Digitalizar o processo de admissão de novos membros
- ✅ Facilitar a comunicação entre membros
- ✅ Rastrear indicações e negócios gerados
- ✅ Fornecer métricas de performance individual e coletiva
- ✅ Simplificar o controle financeiro e de presença

---

## ⚡ Funcionalidades

### ✅ Implementadas (Fase 1 e 2)

#### Autenticação e Autorização
- [x] Login com email e senha
- [x] Registro de novos membros com token de convite
- [x] Proteção de rotas com JWT (httpOnly cookies)
- [x] Middleware de autorização por roles (ADMIN/MEMBER)
- [x] Logout seguro

#### Gestão de Membros
- [x] Schema completo de usuários e perfis no Prisma
- [x] Suporte a status de usuário (ATIVO, INATIVO, SUSPENSO)
- [x] Perfis detalhados com informações profissionais

### 🚧 Em Desenvolvimento (Fase 3)

#### Fluxo de Admissão
- [ ] Formulário público de intenção de participação
- [ ] Área administrativa para revisar intenções
- [ ] Aprovação/rejeição com geração de tokens
- [ ] Página de cadastro completo
- [ ] Serviço de e-mail (mock com console.log)

### 📅 Planejadas (Fases 4 e 5)

- Dashboard com estatísticas e KPIs
- Sistema de indicações de negócios
- Controle de presença em reuniões
- Módulo financeiro (mensalidades)
- Comunicados e avisos
- Relatórios de performance

---

## 🛠️ Stack Tecnológica

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React com SSR e API Routes
- **[React 19](https://react.dev/)** - Biblioteca para interfaces de usuário
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[TailwindCSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Shadcn/ui](https://ui.shadcn.com/)** - Componentes acessíveis e customizáveis
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first

### Backend
- **[Prisma ORM 6.19](https://www.prisma.io/)** - ORM moderno TypeScript-first
- **[SQLite](https://www.sqlite.org/)** - Banco de dados (desenvolvimento)
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de senhas
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - Autenticação JWT

### Testes
- **[Jest 30](https://jestjs.io/)** - Framework de testes
- **[React Testing Library 16](https://testing-library.com/react)** - Testes de componentes
- **[ts-jest](https://kulshekhar.github.io/ts-jest/)** - Suporte TypeScript para Jest

### Ferramentas
- **[pnpm](https://pnpm.io/)** - Gerenciador de pacotes eficiente
- **[tsx](https://github.com/privatenumber/tsx)** - Executor TypeScript
- **[ESLint](https://eslint.org/)** - Linter JavaScript/TypeScript

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 9+ (recomendado) ou npm/yarn
  ```bash
  npm install -g pnpm
  ```

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/FabioHAraujo/ag-sistemas.git
cd ag-sistemas
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-secret-super-secreto-aqui"
JWT_EXPIRES_IN="24h"

# Admin (credenciais iniciais)
ADMIN_EMAIL="admin@networking.com"
ADMIN_PASSWORD="Admin@123"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configure o banco de dados

Execute as migrations do Prisma:

```bash
pnpm db:migrate
```

### 5. Crie o usuário administrador

```bash
pnpm create-admin
```

Credenciais padrão:
- **Email:** admin@networking.com
- **Senha:** Admin@123

---

## 💻 Uso

### Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Build de Produção

```bash
pnpm build
pnpm start
```

### Prisma Studio

Visualize e edite dados do banco:

```bash
pnpm db:studio
```

---

## 🧪 Testes

### Executar todos os testes

```bash
pnpm test
```

### Modo watch (desenvolvimento)

```bash
pnpm test:watch
```

### Coverage report

```bash
pnpm test:coverage
```

### Status atual dos testes

```
 PASS  __tests__/unit/jwt.test.ts
 PASS  __tests__/unit/password.test.ts
 PASS  __tests__/components/button.test.tsx

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
```

---

## 📁 Estrutura do Projeto

```
ag-sistemas/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── auth/             # Endpoints de autenticação
│   ├── layout.tsx            # Layout raiz
│   ├── page.tsx              # Página inicial
│   └── globals.css           # Estilos globais
│
├── components/               # Componentes React
│   └── ui/                   # Componentes base (Shadcn)
│       └── button.tsx
│
├── lib/                      # Utilitários e serviços
│   ├── auth/                 # Sistema de autenticação
│   │   ├── jwt.ts            # Geração e validação JWT
│   │   ├── password.ts       # Hash de senhas (bcrypt)
│   │   └── get-current-user.ts  # Helpers de autenticação
│   ├── prisma.ts             # Prisma Client singleton
│   └── utils.ts              # Funções utilitárias
│
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Schema do banco de dados
│   └── migrations/           # Histórico de migrações
│
├── __tests__/                # Testes
│   ├── unit/                 # Testes unitários
│   ├── components/           # Testes de componentes
│   ├── integration/          # Testes de integração
│   └── e2e/                  # Testes end-to-end
│
├── __mocks__/                # Mocks para testes
│
├── scripts/                  # Scripts utilitários
│   └── create-admin.ts       # Criar usuário admin
│
├── ARQUITETURA.md            # Documentação da arquitetura
├── README.md                 # Este arquivo
└── package.json              # Dependências e scripts
```

---

## 🔌 API Endpoints

### Autenticação

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| `POST` | `/api/auth/login` | Login com email/senha | Não |
| `POST` | `/api/auth/register` | Registro com token de convite | Não |
| `GET` | `/api/auth/me` | Dados do usuário autenticado | Sim |
| `POST` | `/api/auth/logout` | Logout (limpa cookie) | Sim |

### Exemplos de Requisições

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@networking.com",
    "password": "Admin@123"
  }'
```

#### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-de-convite-aqui",
    "password": "MinhaS3nh@Segura",
    "phone": "+5511999999999",
    "position": "CEO",
    "bio": "Minha bio profissional"
  }'
```

---

## 📚 Documentação

### Arquitetura Completa

Consulte o documento **[ARQUITETURA.md](./ARQUITETURA.md)** para detalhes sobre:

- Diagrama da arquitetura completa
- Modelo de dados (schema Prisma)
- Estrutura de componentes
- Definição completa da API
- Fluxos principais (admissão, indicações, check-in)
- Considerações de segurança
- Estratégias de escalabilidade

### Schema do Banco de Dados

O projeto utiliza Prisma ORM com os seguintes modelos principais:

- `User` - Usuários do sistema
- `MemberProfile` - Perfis detalhados dos membros
- `Application` - Intenções de participação
- *(Outros modelos planejados: Referral, Meeting, Announcement, Payment)*

---

## 🗺️ Roadmap

### ✅ Fase 1: Setup (Completa)
- [x] Configuração Next.js + TypeScript
- [x] Prisma ORM + SQLite
- [x] TailwindCSS 4 + Shadcn/ui
- [x] Jest + React Testing Library

### ✅ Fase 2: Autenticação (Completa)
- [x] Sistema de autenticação JWT
- [x] API Routes (login, register, me, logout)
- [x] Middleware de proteção de rotas
- [x] Testes unitários

### 🚧 Fase 3: Fluxo de Admissão (Em Andamento)
- [ ] Formulário público de intenção
- [ ] Área admin de revisão
- [ ] Aprovação/rejeição + geração de tokens
- [ ] Página de cadastro completo

### 📅 Fase 4: Dashboard (Planejada)
- [ ] Componentes de estatísticas
- [ ] Gráficos e métricas
- [ ] API de dashboard

### 📅 Fase 5: Refinamento (Planejada)
- [ ] Validações completas
- [ ] Tratamento de erros
- [ ] Testes de integração
- [ ] Deploy em produção

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenções de Commit

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `test:` - Testes
- `refactor:` - Refatoração
- `chore:` - Tarefas gerais

---

## 📄 Licença

Este projeto foi desenvolvido como parte de um teste técnico e está disponível para fins educacionais.

---

## 👨‍💻 Autor

**Fábio Henrique Araújo**

- GitHub: [@FabioHAraujo](https://github.com/FabioHAraujo)

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework incrível
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes excepcionais
- [Prisma](https://www.prisma.io/) - ORM moderno e eficiente
- [Coolify](https://coolify.io/) - Me ajudando com meus deploys há 2 anos, simplesmente a melhor plataforma para quem tem servidor próprio ❤️

---

<div align="center">
  
**Desenvolvido com ❤️ e ☕ usando Next.js 16 + React 19**

</div>
