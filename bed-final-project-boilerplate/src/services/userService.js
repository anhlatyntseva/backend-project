//import { PrismaClient } from '@prisma/client';
//const prisma = new PrismaClient();
import { prisma } from '../lib/prisma.js';
export const getAllUsers = ({ username, email } = {}) => {
  return prisma.user.findMany({
    where: {
      ...(username && {
        username: {
          contains: username,
        }
      }),
      ...(email && {
        email: {
          contains: email,
        }
      })
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
    }
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phoneNumber: true,
      pictureUrl: true,
    },
  });
};

export const createUser = async (data) => {
  try {
    const payload = {
      email: data.email,
      password: data.password,
      name: data.name,
      username: data.username,
      phoneNumber: data.phoneNumber ?? '',
      pictureUrl: data.pictureUrl ?? '',
    };
    return await prisma.user.create({
      data: payload,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        pictureUrl: true,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};


export const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
    },
  });
};

export const deleteUser = async (id) => {
  await prisma.$transaction([
    prisma.booking.deleteMany({ where: { userId: id } }),
    prisma.review.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
  return { id };
};
export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};