import 'dotenv/config';
import express from 'express';
import * as Sentry from '@sentry/node';
import { prisma } from './lib/prisma.js';
import requestLogger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bookingRoutes from './routes/bookingRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import hostRoutes from './routes/hostRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import amenityRoutes from './routes/amenityRoutes.js';

console.log('[server] DATABASE_URL =', process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- SENTRY ----------
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ---------- CORE MIDDLEWARE ----------
app.use(express.json());
app.use(requestLogger);

// ---------- ROUTES ----------
app.use('/login', authRoutes);
app.use('/users', userRoutes);
app.use('/bookings', bookingRoutes);
app.use('/properties', propertyRoutes);
app.use('/hosts', hostRoutes);
app.use('/reviews', reviewRoutes);
app.use('/amenities', amenityRoutes);

// Unified 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Sentry error handler (if enabled)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler
app.use(errorHandler);

// ---------- ENSURE FIXED TEST DATA BEFORE LISTEN ----------

async function ensureFixedRecords() {
  const FIXED_PROPERTY_ID = 'h0123456-78f0-1234-5678-9abcdef01234';
  const PREFERRED_HOST_ID = 'e2345678-90bc-def0-0123-456789abcdef';

  // 1) Ensure host (prefer specific id, fallback to any or create)
  let host = await prisma.host.findUnique({ where: { id: PREFERRED_HOST_ID } });
  if (!host) {
    host = await prisma.host.findFirst();
    if (!host) {
      host = await prisma.host.create({
        data: {
          id: PREFERRED_HOST_ID,
          username: 'seed-host',
          password: 'seed-pass',
          name: 'Seed Host',
          email: 'seed-host@example.com',
          phoneNumber: '',
          pictureUrl: '',
          aboutMe: '',
        },
      });
    }
  }

  // 2) Ensure property with fixed id (id used by tests)
  await prisma.property.upsert({
    where: { id: FIXED_PROPERTY_ID },
    update: {},
    create: {
      id: FIXED_PROPERTY_ID,
      title: 'Cozy Mountain Retreat',
      description: 'Ensured by server start',
      location: 'Malibu, California',
      pricePerNight: 310.25,
      bedroomCount: 3,
      bathroomCount: 2,
      maxGuestCount: 5,
      rating: 5,
      hostId: host.id,
    },
  });

  const ok = await prisma.property.findUnique({
    where: { id: FIXED_PROPERTY_ID }, select: { id: true }
  });
  console.log('[server] fixed property present =', !!ok);
}

// ВАЖНО: дождаться ensureFixedRecords ПЕРЕД запуском прослушки порта
await ensureFixedRecords();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
