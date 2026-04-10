-- Align User.email with application expectations (required)
UPDATE "User" SET email = COALESCE(NULLIF(TRIM(email), ''), id || '@clerk.placeholder.invalid')
WHERE email IS NULL OR TRIM(email) = '';

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- Hot paths: availability + client appointment lists
CREATE INDEX "Appointment_barberId_date_status_idx" ON "Appointment"("barberId", "date", "status");
CREATE INDEX "Appointment_clientId_date_idx" ON "Appointment"("clientId", "date");
