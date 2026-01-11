//import { PrismaClient } from '@prisma/client';

//const prisma = new PrismaClient();
import { prisma } from '../lib/prisma.js';
export const getAllBookings = ({ userId } = {}) => {
  return prisma.booking.findMany({
    where: { ...(userId && { userId }) },
    select: {
      id: true,
      userId: true, 
      propertyId: true,  
      checkinDate: true,
      checkoutDate: true,
      numberOfGuests: true,
      totalPrice: true,
      bookingStatus: true,
      user: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, location: true } },
    },
  });
};
export const getBookingById = (id) => {
  return prisma.booking.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,        
      propertyId: true,   
      checkinDate: true,
      checkoutDate: true,
      numberOfGuests: true,
      totalPrice: true,
      bookingStatus: true,
      user: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, location: true } },
    },
  });
};

export const createBooking = (data) => {
  return prisma.booking.create({
    data,
    select: {
      id: true,
      userId: true,
      propertyId: true,
      checkinDate: true,
      checkoutDate: true,
      numberOfGuests: true,
      totalPrice: true,
      bookingStatus: true,
    },
  });
};

export const updateBooking = (id, data) => {
  return prisma.booking.update({
    where: { id },
    data,
    select: {
      id: true,
      userId: true,
      propertyId: true,
      checkinDate: true,
      checkoutDate: true,
      numberOfGuests: true,
      totalPrice: true,
      bookingStatus: true,
    },
  });
};
export const deleteBooking = (id) => {
  return prisma.booking.delete({
    where: { id },
  });
};