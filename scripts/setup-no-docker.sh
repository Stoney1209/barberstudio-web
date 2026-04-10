#!/usr/bin/env bash
set -euo pipefail

echo "[Setup] No-Docker PostgreSQL setup for BarberStudio"

DB_NAME="barberstudio"
DB_USER="barber"
DB_PASS="barber"
DB_HOST="localhost"
DB_PORT="5432"

echo "Ensuring PostgreSQL is accessible..."
if ! command -v psql >/dev/null 2>&1; then
  echo "psql no encontrado. Instala PostgreSQL y asegúrate de que el binario esté en PATH."; exit 1
fi

echo "Creando base de datos si no existe: $DB_NAME"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" >/dev/null 2>&1 || \
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"

echo "Instalando dependencias..."
npm install --legacy-peer-deps

echo "Generando Prisma Client y migrando..."
npx prisma migrate dev --name init
npx prisma generate

echo "Ejecutando seeds..."
npm run seed

echo "Iniciando la app (en segundo plano). Si prefieres, abre otra terminal y ejecuta 'npm run dev'."
npm run dev
