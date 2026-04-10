# Setup BarberStudio (No Docker)

Este plan describe cómo levantar la base de datos PostgreSQL localmente y poner en marcha la app sin docker.

Requisitos previos
- PostgreSQL instalado en tu máquina (versión 13+ recomendado).
- Node.js instalado (LTS recomendado).

Pasos de instalación y arranque
1) Crear la base de datos PostgreSQL
- En PostgreSQL local, crear la DB barberstudio y usuario barber (con permisos):
- CREATE DATABASE barberstudio;
- CREATE USER barber WITH PASSWORD 'barber';
- GRANT ALL PRIVILEGES ON DATABASE barberstudio TO barber;

2) Configurar la app
- Copia .env.example a .env.local y ajusta:
- DATABASE_URL="postgresql://barber:barber@localhost:5432/barberstudio"
- NEXT_PUBLIC_CLERK_FRONTEND_API="https://rare-lynx-68.clerk.accounts.dev"
- CLERK_API_KEY (clave de Clerk)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (opcional)
- CLOUDINARY_HOST, SMTP, etc. según necesites

3) Instalar dependencias y generar clientes
- npm install --legacy-peer-deps
- npx prisma migrate dev --name init
- npx prisma generate

4) Seeds (datos de ejemplo)
- npm run seed

5) Arrancar la app
- npm run dev

6) Verificación rápida
- Admin: http://localhost:3000/admin/dashboard (login con admin@barberstudio.test)
- Cliente: http://localhost:3000/cliente/reservar (flow de Stepper)
- API: /api/services, /api/barbers, /api/appointments
