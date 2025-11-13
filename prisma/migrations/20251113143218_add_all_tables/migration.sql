-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "target_audience" TEXT NOT NULL DEFAULT 'ALL',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" DATETIME,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meeting_date" DATETIME NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "meetings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meeting_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABSENT',
    "checked_in_at" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "meeting_attendances_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_attendances_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from_member_id" TEXT NOT NULL,
    "to_member_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "opportunity_description" TEXT NOT NULL,
    "estimated_value" REAL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "closed_value" REAL,
    "closed_at" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "referrals_from_member_id_fkey" FOREIGN KEY ("from_member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "referrals_to_member_id_fkey" FOREIGN KEY ("to_member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "referral_updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referral_id" TEXT NOT NULL,
    "previous_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referral_updates_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "referral_updates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "thank_yous" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from_member_id" TEXT NOT NULL,
    "to_member_id" TEXT NOT NULL,
    "referral_id" TEXT,
    "message" TEXT NOT NULL,
    "business_value" REAL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "thank_yous_from_member_id_fkey" FOREIGN KEY ("from_member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "thank_yous_to_member_id_fkey" FOREIGN KEY ("to_member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "thank_yous_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "one_on_one_meetings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "member_one_id" TEXT NOT NULL,
    "member_two_id" TEXT NOT NULL,
    "meeting_date" DATETIME NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "one_on_one_meetings_member_one_id_fkey" FOREIGN KEY ("member_one_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "one_on_one_meetings_member_two_id_fkey" FOREIGN KEY ("member_two_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL DEFAULT 'MONTHLY',
    "amount" REAL NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "memberships_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membership_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "due_date" DATETIME NOT NULL,
    "paid_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payments_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "announcements_published_published_at_idx" ON "announcements"("published", "published_at");

-- CreateIndex
CREATE INDEX "meetings_meeting_date_idx" ON "meetings"("meeting_date");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendances_meeting_id_member_id_key" ON "meeting_attendances"("meeting_id", "member_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_from_member_id_idx" ON "referrals"("from_member_id");

-- CreateIndex
CREATE INDEX "referrals_to_member_id_idx" ON "referrals"("to_member_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_due_date_idx" ON "payments"("due_date");
