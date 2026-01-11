//import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

function buildPropertyPayload(input = {}) {
  const payload = {};

  if (input.title !== undefined)        payload.title = String(input.title);
  if (input.description !== undefined)  payload.description = String(input.description);
  if (input.location !== undefined)     payload.location = String(input.location);
  if (input.hostId !== undefined)       payload.hostId = String(input.hostId);

  if (input.pricePerNight !== undefined)  payload.pricePerNight  = parseFloat(input.pricePerNight);
  if (input.bedroomCount !== undefined)   payload.bedroomCount   = parseInt(input.bedroomCount, 10);
  // принимаем и bathroomCount, и bathRoomCount
  const brc = input.bathroomCount ?? input.bathRoomCount;
  if (brc !== undefined)                  payload.bathroomCount  = parseInt(brc, 10);
  if (input.maxGuestCount !== undefined)  payload.maxGuestCount  = parseInt(input.maxGuestCount, 10);
  if (input.rating !== undefined)         payload.rating         = parseInt(Math.round(Number(input.rating)), 10);

  Object.keys(payload).forEach(k => {
    if (payload[k] === undefined || Number.isNaN(payload[k])) delete payload[k];
  });

  return payload;
}
export const getAllProperties = ({ location, pricePerNight, amenities }) => {
  return prisma.property.findMany({
    where: {
      ...(location && { location: { contains: location } }),
      ...(pricePerNight && { pricePerNight: parseFloat(pricePerNight) }),
      ...(amenities && {
        amenities: { some: { name: { contains: amenities } } }
      })
    },
    include: { amenities: true, reviews: true }
  });
};

export const getPropertyById = (id) => {
  return prisma.property.findFirst({
    where: { id: { equals: id } },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      pricePerNight: true,
      bedroomCount: true,
      bathroomCount: true,
      maxGuestCount: true,
      rating: true,
      host: { select: { id: true, name: true, email: true } },
      amenities: { select: { id: true, name: true } },
      booking: { select: { id: true, checkinDate: true, checkoutDate: true, totalPrice: true } },
      reviews: { select: { id: true, comment: true, rating: true } },
    },
  });
};

export const createProperty = (data) => {
  const payload = buildPropertyPayload(data);
  return prisma.property.create({
    data: payload,
    select: {
      id: true, title: true, description: true, location: true,
      pricePerNight: true, bedroomCount: true, bathroomCount: true,
      maxGuestCount: true, rating: true, hostId: true
    }
  });
};

export const updateProperty = (id, data) => {
  const payload = buildPropertyPayload(data);
  return prisma.property.update({
    where: { id },
    data: payload,
    select: {
      id: true, title: true, description: true, location: true,
      pricePerNight: true, bedroomCount: true, bathroomCount: true,
      maxGuestCount: true, rating: true, hostId: true
    }
  });
};

export const deleteProperty = async (id) => {
  try {
    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { propertyId: id } }),
      prisma.review.deleteMany({ where: { propertyId: id } }),
      prisma.property.delete({ where: { id } }),
    ]);
    return { id };
  } catch (e) {
    if (e.code === 'P2025') {
      const err = new Error('Property not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    throw e;
  }
};