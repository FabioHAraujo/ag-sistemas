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
- **Database-Agnostic**: Prisma ORM para facilitar migração entre bancos de dados

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
| **Prisma ORM**        | ORM moderno “TypeScript-first”.               | Schema declarativo e intuitivo, migrações automáticas, Prisma Client totalmente tipado e fácil migração entre bancos de dados (SQLite, PostgreSQL, MySQL). |
| **SQLite**             | Banco de dados relacional leve em arquivo único.               | Ideal para desenvolvimento e testes. Com Prisma, migração para PostgreSQL ou MySQL é trivial, bastando alterar o provider no schema.                |
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


## Modelo de Dados (Prisma ORM)

### Diagrama de Relacionamentos (ER Diagram)

![Diagrama ER do Banco de Dados](./docs/diagrama-er.svg)

---

### Tabelas Principais

**🔐 Core (Autenticação e Membros)**
- `User` - Usuários do sistema (admin/member)
- `Application` - Intenções de participação
- `MemberProfile` - Perfil completo dos membros

**📢 Comunicação e Engajamento**
- `Announcement` - Avisos e comunicados
- `Meeting` - Reuniões do grupo
- `MeetingAttendance` - Controle de presença

**💼 Negócios**
- `Referral` - Indicações de negócios
- `ReferralUpdate` - Histórico de status
- `ThankYou` - Agradecimentos públicos
- `OneOnOneMeeting` - Reuniões 1-a-1

**💰 Financeiro**
- `Membership` - Planos de mensalidade
- `Payment` - Pagamentos

---

<details>
<summary>📋 <strong>Schema Completo Prisma ORM (clique para expandir)</strong></summary>

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  
  // Provider para PostgreSQL para produção
  // provider = "postgresql"
  // url      = env("DATABASE_URL")
  
  // MySQL/MariaDB como alternativa ao PostgreSQL
  // provider = "mysql"
  // url      = env("DATABASE_URL")
}

// ========================================
// ENUMS
// ========================================

enum Role {
  ADMIN
  MEMBER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum TargetAudience {
  ALL
  MEMBERS
  ADMINS
}

enum MeetingType {
  REGULAR
  SPECIAL
  ONE_ON_ONE
}

enum MeetingStatus {
  SCHEDULED
  ONGOING
  COMPLETED
  CANCELLED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  EXCUSED
  LATE
}

enum ReferralStatus {
  SENT
  CONTACTED
  NEGOTIATING
  CLOSED_WON
  CLOSED_LOST
}

enum OneOnOneStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum PlanType {
  MONTHLY
  QUARTERLY
  ANNUAL
}

enum MembershipStatus {
  ACTIVE
  CANCELLED
  SUSPENDED
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

// ========================================
// CORE MODELS
// ========================================

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String     @map("password_hash")
  name         String
  role         Role       @default(MEMBER)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  // Relations
  profile               MemberProfile?
  reviewedApplications  Application[]        @relation("ApplicationReviewer")
  announcements         Announcement[]
  createdMeetings       Meeting[]
  attendances           MeetingAttendance[]
  sentReferrals         Referral[]           @relation("ReferralSender")
  receivedReferrals     Referral[]           @relation("ReferralReceiver")
  referralUpdates       ReferralUpdate[]
  givenThankYous        ThankYou[]           @relation("ThankYouSender")
  receivedThankYous     ThankYou[]           @relation("ThankYouReceiver")
  oneOnOneMeetingsAsOne OneOnOneMeeting[]    @relation("MemberOne")
  oneOnOneMeetingsAsTwo OneOnOneMeeting[]    @relation("MemberTwo")
  memberships           Membership[]
  payments              Payment[]

  @@index([email])
  @@index([role])
  @@map("users")
}

model Application {
  id             String            @id @default(uuid())
  name           String
  email          String
  company        String
  motivation     String
  status         ApplicationStatus @default(PENDING)
  reviewedBy     String?           @map("reviewed_by")
  reviewedAt     DateTime?         @map("reviewed_at")
  token          String?           @unique
  tokenExpiresAt DateTime?         @map("token_expires_at")
  createdAt      DateTime          @default(now()) @map("created_at")
  updatedAt      DateTime          @updatedAt @map("updated_at")

  // Relations
  reviewer User?          @relation("ApplicationReviewer", fields: [reviewedBy], references: [id])
  profile  MemberProfile?

  @@index([status])
  @@index([email])
  @@map("applications")
}

model MemberProfile {
  id                 String   @id @default(uuid())
  userId             String   @unique @map("user_id")
  applicationId      String?  @map("application_id")
  phone              String?
  company            String
  position           String?
  companyDescription String?  @map("company_description")
  expertiseArea      String?  @map("expertise_area")
  linkedinUrl        String?  @map("linkedin_url")
  websiteUrl         String?  @map("website_url")
  profileImageUrl    String?  @map("profile_image_url")
  bio                String?
  joinedAt           DateTime @default(now()) @map("joined_at")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  // Relations
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  application Application? @relation(fields: [applicationId], references: [id])

  @@map("member_profiles")
}

// ========================================
// COMUNICAÇÃO MODELS
// ========================================

model Announcement {
  id             String         @id @default(uuid())
  title          String
  content        String
  authorId       String         @map("author_id")
  priority       Priority       @default(NORMAL)
  targetAudience TargetAudience @default(ALL) @map("target_audience")
  published      Boolean        @default(false)
  publishedAt    DateTime?      @map("published_at")
  expiresAt      DateTime?      @map("expires_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  // Relations
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([published, publishedAt])
  @@map("announcements")
}

model Meeting {
  id          String        @id @default(uuid())
  title       String
  description String?
  meetingDate DateTime      @map("meeting_date")
  location    String?
  type        MeetingType
  status      MeetingStatus @default(SCHEDULED)
  createdBy   String        @map("created_by")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  // Relations
  creator     User                @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  attendances MeetingAttendance[]

  @@index([meetingDate])
  @@map("meetings")
}

model MeetingAttendance {
  id          String           @id @default(uuid())
  meetingId   String           @map("meeting_id")
  memberId    String           @map("member_id")
  status      AttendanceStatus @default(ABSENT)
  checkedInAt DateTime?        @map("checked_in_at")
  notes       String?
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  // Relations
  meeting Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  member  User    @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([meetingId, memberId])
  @@map("meeting_attendances")
}

// ========================================
// NEGÓCIOS MODELS
// ========================================

model Referral {
  id                     String         @id @default(uuid())
  fromMemberId           String         @map("from_member_id")
  toMemberId             String         @map("to_member_id")
  companyName            String         @map("company_name")
  contactName            String         @map("contact_name")
  contactEmail           String?        @map("contact_email")
  contactPhone           String?        @map("contact_phone")
  opportunityDescription String         @map("opportunity_description")
  estimatedValue         Float?         @map("estimated_value")
  status                 ReferralStatus @default(SENT)
  closedValue            Float?         @map("closed_value")
  closedAt               DateTime?      @map("closed_at")
  notes                  String?
  createdAt              DateTime       @default(now()) @map("created_at")
  updatedAt              DateTime       @updatedAt @map("updated_at")

  // Relations
  fromMember User             @relation("ReferralSender", fields: [fromMemberId], references: [id], onDelete: Cascade)
  toMember   User             @relation("ReferralReceiver", fields: [toMemberId], references: [id], onDelete: Cascade)
  updates    ReferralUpdate[]
  thankYous  ThankYou[]

  @@index([status])
  @@index([fromMemberId])
  @@index([toMemberId])
  @@map("referrals")
}

model ReferralUpdate {
  id             String   @id @default(uuid())
  referralId     String   @map("referral_id")
  previousStatus String   @map("previous_status")
  newStatus      String   @map("new_status")
  updatedBy      String   @map("updated_by")
  comment        String?
  createdAt      DateTime @default(now()) @map("created_at")

  // Relations
  referral Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)
  updater  User     @relation(fields: [updatedBy], references: [id], onDelete: Cascade)

  @@map("referral_updates")
}

model ThankYou {
  id            String    @id @default(uuid())
  fromMemberId  String    @map("from_member_id")
  toMemberId    String    @map("to_member_id")
  referralId    String?   @map("referral_id")
  message       String
  businessValue Float?    @map("business_value")
  isPublic      Boolean   @default(true) @map("is_public")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  fromMember User      @relation("ThankYouSender", fields: [fromMemberId], references: [id], onDelete: Cascade)
  toMember   User      @relation("ThankYouReceiver", fields: [toMemberId], references: [id], onDelete: Cascade)
  referral   Referral? @relation(fields: [referralId], references: [id])

  @@map("thank_yous")
}

model OneOnOneMeeting {
  id           String         @id @default(uuid())
  memberOneId  String         @map("member_one_id")
  memberTwoId  String         @map("member_two_id")
  meetingDate  DateTime       @map("meeting_date")
  location     String?
  status       OneOnOneStatus @default(SCHEDULED)
  notes        String?
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  // Relations
  memberOne User @relation("MemberOne", fields: [memberOneId], references: [id], onDelete: Cascade)
  memberTwo User @relation("MemberTwo", fields: [memberTwoId], references: [id], onDelete: Cascade)

  @@map("one_on_one_meetings")
}

// ========================================
// FINANCEIRO MODELS
// ========================================

model Membership {
  id        String           @id @default(uuid())
  memberId  String           @map("member_id")
  planType  PlanType         @default(MONTHLY) @map("plan_type")
  amount    Float
  startDate DateTime         @map("start_date")
  endDate   DateTime?        @map("end_date")
  status    MembershipStatus @default(ACTIVE)
  createdAt DateTime         @default(now()) @map("created_at")
  updatedAt DateTime         @updatedAt @map("updated_at")

  // Relations
  member   User      @relation(fields: [memberId], references: [id], onDelete: Cascade)
  payments Payment[]

  @@map("memberships")
}

model Payment {
  id            String        @id @default(uuid())
  membershipId  String        @map("membership_id")
  memberId      String        @map("member_id")
  amount        Float
  dueDate       DateTime      @map("due_date")
  paidAt        DateTime?     @map("paid_at")
  status        PaymentStatus @default(PENDING)
  paymentMethod String?       @map("payment_method")
  transactionId String?       @map("transaction_id")
  notes         String?
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  // Relations
  membership Membership @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  member     User       @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([status])
  @@index([dueDate])
  @@map("payments")
}
```

</details>

---