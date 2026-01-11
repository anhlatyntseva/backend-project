//import { PrismaClient } from '@prisma/client';

//const prisma = new PrismaClient();

import { prisma } from '../lib/prisma.js';
export const getAllAmenities = () => {
  return prisma.amenity.findMany();
};

export const getAmenityById = (id) => {
  return prisma.amenity.findUnique({ where: { id } });
};

export const createAmenity = (data) => {
  return prisma.amenity.create({ data });
};

export const updateAmenity = (id, data) => {
  return prisma.amenity.update({ where: { id }, data });
};

export const deleteAmenity = (id) => {
  return prisma.amenity.delete({ where: { id } });
};