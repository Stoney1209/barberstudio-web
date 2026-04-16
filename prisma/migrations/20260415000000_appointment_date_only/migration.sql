ALTER TABLE "Appointment"
ALTER COLUMN "date" TYPE DATE
USING "date"::date;
