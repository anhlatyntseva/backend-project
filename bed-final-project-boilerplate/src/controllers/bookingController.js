import * as bookingService from '../services/bookingService.js';
const prismaToHttp = (err, res, fallbackMsg) => {
  const code = err?.code;
  if (code === 'P2025') return res.status(404).json({ message: err?.meta?.cause || 'Not found' });
  if (err?.name === 'PrismaClientValidationError' || String(code || '').startsWith('P20')) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  return res.status(500).json({ message: fallbackMsg });
};
export const getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings(req.query);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBooking = async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
};
export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      propertyId,
      checkinDate,
      checkoutDate,
      numberOfGuests,
      totalPrice,
      bookingStatus,
    } = req.body ?? {};

    // Минимальная валидация, чтобы вместо 500 отдавать 400
    if (!userId || !propertyId || !checkinDate || !checkoutDate || numberOfGuests == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newBooking = await bookingService.createBooking({
      userId,
      propertyId,
      checkinDate,
      checkoutDate,
      numberOfGuests,
      totalPrice,
      bookingStatus,
    });

    return res.status(201).json(newBooking);
  } catch (err) {
    console.error('[createBooking] error:', err);

    // Нарушение внешних ключей (несуществующий userId/propertyId) — это 400
    if (err?.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid userId or propertyId' });
    }
    // Валидация Prisma/невалидные типы → 400
    if (err?.name === 'PrismaClientValidationError' || String(err?.code || '').startsWith('P20')) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    // Остальное — 500
    return res.status(500).json({ message: 'Failed to create booking' });
  }
};

export const updateBooking = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    const updated = await bookingService.updateBooking(id, req.body);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to update booking');
  }
};

export const deleteBooking = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });

  try {
    await bookingService.deleteBooking(id);
    return res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to delete booking');
  }
};