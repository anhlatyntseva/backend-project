//import { PrismaClient } from '@prisma/client';

//const prisma = new PrismaClient();
import { prisma } from '../lib/prisma.js';
export const getAllReviews = () => {
  return prisma.review.findMany({
    select: {
      id: true,
      rating: true,
      comment: true,
      userId: true,       
      propertyId: true,    
      user: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, location: true } },
    },
  });
};
export const getReviewById = (id) => {
  return prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      rating: true,
      comment: true,
      userId: true,     
      propertyId: true,   
      user: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, location: true } },
    },
  });
};

export const createReview = (data) => {
  return prisma.review.create({
    data,
    select: {
      id: true,
      rating: true,
      comment: true,
      userId: true,
      propertyId: true,
    },
  });
};

export const updateReview = (id, data) => {
  return prisma.review.update({
    where: { id },
    data,
    select: {
      id: true,
      rating: true,
      comment: true,
      userId: true,
      propertyId: true,
    },
  });
};
export const deleteReview = (id) => {
  return prisma.review.delete({ where: { id } });
};