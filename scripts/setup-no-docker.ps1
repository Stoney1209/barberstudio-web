param()
{
}

Write-Host "[Setup] No-Docker PostgreSQL setup for BarberStudio" -ForegroundColor Cyan

$DB_NAME = "barberstudio"
$DB_USER = "barber"
$DB_PASS = "barber"
$DB_HOST = "localhost"
$DB_PORT = 5432

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  Write-Error "psql no encontrado. Instala PostgreSQL y asegúrate de que el binario esté en PATH."
  exit 1
}

Write-Host "Creando base de datos si no existe: $DB_NAME"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c ("SELECT 1 FROM pg_database WHERE datname='$DB_NAME'") | Out-Null
if ($LASTEXITCODE -ne 0) {
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c ("CREATE DATABASE \"$DB_NAME\";")
}

Write-Host "Instalando dependencias..."
npm install --legacy-peer-deps

Write-Host "Generando Prisma Client y migrando..."
npx prisma migrate dev --name init
npx prisma generate

Write-Host "Ejecutando seeds..."
npm run seed

Write-Host "Iniciando la app (npm run dev)."
npm run dev
