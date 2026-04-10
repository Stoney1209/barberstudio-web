# BarberStudio: Setup sin Docker

Guía rápida para correr BarberStudio con PostgreSQL local.

- Requisitos: Node.js, PostgreSQL
- DB: barberstudio, usuario barber, password barber, host localhost, puerto 5432
- VARIABLES CLAVE: DATABASE_URL (postgresql://barber:barber@localhost:5432/barberstudio), Clerk keys
- Pasos: copiar .env.example a .env.local, instalar dependencias, migrar, seed, levantar server
- URLs importantes de Clerk y Cloudinary ya configuradas en .env.local

Verificación básica:
- /admin/dashboard (con admin@barberstudio.test)
- /cliente/reservar (cliente autenticado)
- /api/services, /api/barbers, /api/appointments
