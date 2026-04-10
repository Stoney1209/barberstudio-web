import '@testing-library/jest-dom';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(),
  getAuth: jest.fn(() => ({ userId: 'test-user-123' })),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: new PrismaClient(),
}));

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.availability.deleteMany(),
    prisma.gallery.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

export async function resetTestDB() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.availability.deleteMany(),
    prisma.gallery.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function closeTestDB() {
  await prisma.$disconnect();
}

export const testPrisma = prisma;

type UserOverrides = {
  name?: string;
  role?: 'ADMIN' | 'BARBER' | 'CLIENT';
};

type ServiceOverrides = {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: 'FADE' | 'CLASSIC' | 'GRADIENT' | 'BEARD' | 'SHAVE';
};

type AppointmentOverrides = {
  clientId?: string;
  barberId?: string;
  serviceId?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';
};

export function createTestUser(overrides: UserOverrides = {}) {
  const randomId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return prisma.user.create({
    data: {
      id: randomId,
      name: overrides.name || 'Test User',
      email: `user-${randomId}@test.com`,
      phone: '+1234567890',
      role: overrides.role || 'CLIENT',
    },
  });
}

export function createTestBarber(overrides: UserOverrides = {}) {
  const randomId = `barber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return prisma.user.create({
    data: {
      id: randomId,
      name: overrides.name || 'Test Barber',
      email: `barber-${randomId}@test.com`,
      phone: '+1234567890',
      role: 'BARBER',
    },
  });
}

export function createTestService(overrides: ServiceOverrides = {}) {
  return prisma.service.create({
    data: {
      name: overrides.name || 'Test Service',
      description: overrides.description || 'Test description',
      price: overrides.price || 100,
      duration: overrides.duration || 30,
      category: overrides.category || 'FADE',
    },
  });
}

export function createTestAppointment(overrides: AppointmentOverrides = {}) {
  const randomId = `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return prisma.appointment.create({
    data: {
      id: randomId,
      clientId: overrides.clientId || 'test-client',
      barberId: overrides.barberId || 'test-barber',
      serviceId: overrides.serviceId || 'test-service',
      date: overrides.date || new Date(),
      startTime: overrides.startTime || '10:00',
      endTime: overrides.endTime || '10:30',
      status: overrides.status || 'PENDING',
      paymentStatus: overrides.paymentStatus || 'PENDING',
    },
  });
}
