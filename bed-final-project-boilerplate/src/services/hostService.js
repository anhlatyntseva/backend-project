//import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

//const prisma = new PrismaClient();
import { prisma } from '../lib/prisma.js';
export const getAllHosts = ({ name }) => {
  const where = {};
  if (name) where.name = { contains: name };

  return prisma.host.findMany({
    where,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      listings: {
        select: { id: true, title: true, location: true },
      },
    },
  });
};

export const getHostById = (id) => {
  return prisma.host.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      listings: {
        select: {
          id: true,
          title: true,
          location: true,
        },
      },
    },
  });
};

export const createHost = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.host.create({
    data: {
      username: data.username,
      password: hashedPassword,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber ?? '',
      pictureUrl: data.pictureUrl ?? '',
      aboutMe: data.aboutMe ?? '',
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
    },
  });
};

export const updateHost = async (id, data) => {
  const allowed = ['username','password','name','email','phoneNumber','pictureUrl','aboutMe'];
  const updateData = {};

  for (const key of allowed) {
    if (key in data) {
      updateData[key] = data[key];
    }
  }
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // Пустые значения по умолчанию, если нужно обновить на "пусто"
  if ('pictureUrl' in updateData && updateData.pictureUrl == null) updateData.pictureUrl = '';
  if ('aboutMe'   in updateData && updateData.aboutMe   == null) updateData.aboutMe   = '';

  return prisma.host.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
    },
  });
};

export const deleteHost = async (id) => {
  const props = await prisma.property.findMany({
    where: { hostId: id },
    select: { id: true },
  });
  const propertyIds = props.map(p => p.id);

  await prisma.$transaction([
    prisma.booking.deleteMany({ where: { propertyId: { in: propertyIds } } }),
    prisma.review.deleteMany({ where: { propertyId: { in: propertyIds } } }),
    prisma.property.deleteMany({ where: { id: { in: propertyIds } } }),
    prisma.host.delete({ where: { id } }),
  ]);

  return { id };
};