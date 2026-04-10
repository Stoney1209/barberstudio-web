---
name: backend-testing
description: Write comprehensive backend tests including unit tests, integration tests, and API tests. Use when testing REST APIs, database operations, authentication flows, or business logic. Handles Jest, Pytest, testing strategies, mocking, and test coverage. Optimized for Next.js API routes with Prisma.
metadata:
  tags: testing, backend, unit-test, integration-test, API-test, Jest, TDD, Next.js
  platforms: Claude, ChatGPT, Gemini
---

# Backend Testing

## When to use this skill

Specific situations that should trigger this skill:

- **New feature development**: Write tests first using TDD (Test-Driven Development)
- **Adding API endpoints**: Test success and failure cases for REST APIs
- **Bug fixes**: Add tests to prevent regressions
- **Before refactoring**: Write tests that guarantee existing behavior
- **CI/CD setup**: Build automated test pipelines
- **Testing Prisma operations**: Database queries, migrations, transactions
- **Next.js API Routes**: Testing route handlers with Next.js App Router

## Input Format

Format and required/optional information to collect from the user:

### Required information
- **Framework**: Next.js (App Router), Express, etc.
- **Test tool**: Jest, Vitest, etc.
- **Test target**: API endpoints, business logic, DB operations

### Optional information
- **Database**: PostgreSQL, MySQL, SQLite (default: in-memory SQLite)
- **ORM**: Prisma
- **Coverage target**: 80%, 90%, etc. (default: 80%)
- **E2E tool**: Supertest, Playwright (optional)

### Input example

```
Test the appointments API for a barbershop app:
- Framework: Next.js 14 App Router + TypeScript
- Test tool: Jest + Vitest
- Target: POST /api/appointments, GET /api/availability
- DB: SQLite (in-memory for tests)
- ORM: Prisma
- Coverage: 80% or above
```

## Instructions

Step-by-step task order to follow precisely.

### Step 1: Set up the test environment

Install and configure the test framework and tools.

**Tasks**:
- Install test libraries (jest, vitest, @testing-library/*)
- Configure test database (in-memory SQLite)
- Set up Prisma testing utilities
- Configure jest.config.js or vitest.config.ts
- Set up environment variables (.env.test)

**Example** (Next.js + Jest + Prisma):
```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @faker-js/faker prisma
```

**jest.config.js**:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

**prisma/testing.ts**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function resetTestDB() {
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
}

export async function closeTestDB() {
  await prisma.$disconnect();
}

export const testPrisma = prisma;
```

**jest.setup.ts**:
```typescript
import '@testing-library/jest-dom';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Step 2: Write Unit Tests (business logic)

Write unit tests for individual functions and classes.

**Tasks**:
- Test pure functions (no dependencies)
- Isolate dependencies via mocking
- Test edge cases (boundary values, exceptions)
- AAA pattern (Arrange-Act-Assert)

**Example** (appointment validation):
```typescript
// src/lib/validations.ts
export function validateAppointmentDate(date: Date): { valid: boolean; error?: string } {
  const now = new Date();
  const minDate = new Date(now.getTime() + 30 * 60 * 1000);
  
  if (date < minDate) {
    return { valid: false, error: 'Appointment must be at least 30 minutes in the future' };
  }
  
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (date > maxDate) {
    return { valid: false, error: 'Appointment cannot be more than 30 days in the future' };
  }
  
  return { valid: true };
}

// src/lib/__tests__/validations.test.ts
import { validateAppointmentDate } from '../validations';

describe('validateAppointmentDate', () => {
  it('should accept appointment 30+ minutes in the future', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    const result = validateAppointmentDate(futureDate);
    expect(result.valid).toBe(true);
  });

  it('should reject appointment less than 30 minutes in the future', () => {
    const soonDate = new Date(Date.now() + 15 * 60 * 1000);
    const result = validateAppointmentDate(soonDate);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('30 minutes');
  });

  it('should reject appointment more than 30 days in the future', () => {
    const farFutureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const result = validateAppointmentDate(farFutureDate);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('30 days');
  });
});
```

### Step 3: Integration Test (API endpoints)

Write integration tests for Next.js API routes.

**Tasks**:
- Test HTTP requests/responses
- Success cases (200, 201)
- Failure cases (400, 401, 404, 500)
- Authentication/authorization tests
- Input validation tests
- Prisma database state verification

**Checklist**:
- [x] Verify status code
- [x] Validate response body structure
- [x] Confirm database state changes
- [x] Validate error messages
- [x] Test edge cases (empty data, invalid IDs, etc.)

**Example** (Next.js App Router API route testing):
```typescript
// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAppointmentDate } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, serviceId, date } = body;

    if (!clientName || !serviceId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(date);
    const validation = validateAppointmentDate(appointmentDate);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        serviceId,
        date: appointmentDate,
        status: 'PENDING',
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// src/app/api/appointments/__tests__/route.test.ts
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { testPrisma, resetTestDB } from '@/lib/testing';

describe('POST /api/appointments', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  it('should create appointment successfully', async () => {
    const service = await testPrisma.service.create({
      data: {
        name: 'Corte de cabello',
        duration: 30,
        price: 1500,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: 'Juan Perez',
        serviceId: service.id,
        date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.clientName).toBe('Juan Perez');
    expect(data.serviceId).toBe(service.id);
    expect(data.status).toBe('PENDING');
  });

  it('should reject missing clientName', async () => {
    const service = await testPrisma.service.create({
      data: {
        name: 'Corte de cabello',
        duration: 30,
        price: 1500,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: service.id,
        date: new Date().toISOString(),
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required fields');
  });

  it('should reject invalid date', async () => {
    const service = await testPrisma.service.create({
      data: {
        name: 'Corte de cabello',
        duration: 30,
        price: 1500,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: 'Juan Perez',
        serviceId: service.id,
        date: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('30 minutes');
  });

  it('should return 404 for non-existent service', async () => {
    const request = new NextRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: 'Juan Perez',
        serviceId: 'non-existent-id',
        date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toContain('Service not found');
  });
});
```

### Step 4: Testing Availability API

Test the availability endpoint for a barbershop.

**Example**:
```typescript
// src/app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { error: 'Date parameter is required' },
      { status: 400 }
    );
  }

  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
    },
  });

  const bookedTimes = appointments.map(a => a.date.getHours());

  const allTimes = Array.from({ length: 12 }, (_, i) => i + 9);
  const availableTimes = allTimes.filter(t => !bookedTimes.includes(t));

  return NextResponse.json({ available: availableTimes });
}

// src/app/api/availability/__tests__/route.test.ts
import { GET } from '../route';
import { testPrisma, resetTestDB } from '@/lib/testing';

describe('GET /api/availability', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  it('should return available times for a date', async () => {
    const service = await testPrisma.service.create({
      data: {
        name: 'Corte',
        duration: 30,
        price: 1500,
      },
    });

    await testPrisma.appointment.create({
      data: {
        clientName: 'Test Client',
        serviceId: service.id,
        date: new Date('2024-01-15T10:00:00Z'),
        status: 'CONFIRMED',
      },
    });

    const url = new URL('http://localhost:3000/api/availability?date=2024-01-15');
    const request = new NextRequest(url);

    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.available).toContain(9);
    expect(data.available).not.toContain(10);
  });

  it('should return 400 when date is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/availability');

    const response = await GET(request);

    expect(response.status).toBe(400);
  });
});
```

### Step 5: Mocking and Test Isolation

Mock external dependencies to isolate tests.

**Tasks**:
- Mock external APIs
- Mock time-related functions
- Mock Next.js dependencies

**Example** (mocking time):
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));
```

## Output format

### Basic structure

```
project/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── appointments/
│   │       │   ├── route.ts
│   │       │   └── __tests__/
│   │       │       └── route.test.ts
│   │       └── availability/
│   │           ├── route.ts
│   │           └── __tests__/
│   │               └── route.test.ts
│   ├── lib/
│   │   ├── validations.ts
│   │   ├── testing.ts
│   │   └── __tests__/
│   │       └── validations.test.ts
├── jest.config.js
├── jest.setup.ts
└── package.json
```

### Test run scripts (package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## Constraints

### Required rules (MUST)

1. **Test isolation**: Each test must be runnable independently
   - Reset state with beforeEach/afterEach
   - Do not depend on test execution order

2. **Clear test names**: The name must convey what the test verifies
   - ✅ 'should create appointment successfully'
   - ❌ 'test1'

3. **AAA pattern**: Arrange (setup) - Act (execute) - Assert (verify) structure
   - Improves readability
   - Clarifies test intent

4. **Use in-memory database for tests**: SQLite or testcontainers
   - Faster tests
   - No production data pollution
   - Easy to reset

### Prohibited (MUST NOT)

1. **No production DB**: Tests must use a separate or in-memory DB
   - Risk of losing real data
   - Cannot isolate tests

2. **No real external API calls**: Mock all external services
   - Removes network dependency
   - Speeds up tests
   - Reduces costs

3. **No hardcoded IDs in tests**: Always create test data dynamically
   - Tests should be reproducible
   - Use faker.js for test data

### Security rules

- **No hardcoded secrets**: Never hardcode API keys or passwords in test code
- **Separate environment variables**: Use .env.test file

## Best practices

### For Next.js + Prisma projects

1. **Use transactions for cleanup**: In afterEach, use Prisma transactions
   ```typescript
   await prisma.$transaction([
     prisma.appointment.deleteMany(),
     prisma.service.deleteMany(),
   ]);
   ```

2. **Test both success and error paths**: Always test edge cases
   - Empty inputs
   - Invalid IDs
   - Boundary values
   - Concurrent operations

3. **Use faker.js for test data**: Generate realistic test data
   ```typescript
   import { faker } from '@faker-js/faker';
   const randomName = faker.person.fullName();
   ```

### Coverage requirements

Target 80%+ coverage for:
- API route handlers
- Validation functions
- Business logic
- Error handling paths

## Common Issues

### Issue 1: Prisma connection not closed

**Symptom**: "Jest did not exit one second after the test run"

**Cause**: Prisma connection not properly closed

**Fix**:
```typescript
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Issue 2: Test database not reset

**Symptom**: Tests pass individually but fail together

**Cause**: Database state not properly cleaned between tests

**Fix**:
```typescript
beforeEach(async () => {
  await resetTestDB();
});
```

### Issue 3: Date comparison issues

**Symptom**: Date validation fails unexpectedly

**Cause**: Timezone differences between test and production

**Fix**:
```typescript
const testDate = new Date('2024-01-15T10:00:00Z');
expect(appointment.date.toISOString()).toBe(testDate.toISOString());
```

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)
- [Testing Library](https://testing-library.com/)

## Metadata

- **Current version**: 1.0.0
- **Last updated**: 2025-01-01
- **Stack**: Next.js 14, Prisma, Jest, TypeScript
- **Compatible platforms**: Claude, ChatGPT, Gemini

## Tags
`#testing` `#backend` `#Jest` `#Next.js` `#Prisma` `#unit-test` `#integration-test` `#TDD` `#API-test`