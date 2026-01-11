import * as propertyService from '../services/propertyService.js';
import { prisma } from '../lib/prisma.js';
const prismaToHttp = (err, res, fallbackMsg) => {
  const code = err?.code;
  if (code === 'P2025') return res.status(404).json({ message: err?.meta?.cause || 'Not found' });
  if (err?.name === 'PrismaClientValidationError' || String(code || '').startsWith('P20')) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  return res.status(500).json({ message: fallbackMsg });
};
export const getAllProperties = async (req, res) => {
  try {
    const { location, pricePerNight, amenities } = req.query;
    const properties = await propertyService.getAllProperties({ location, pricePerNight, amenities });
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get properties' });
  }
};

export const getPropertyById = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  console.log('[properties:getById] param =', JSON.stringify(id));
  const exists = await prisma.property.findFirst({ where: { id: { equals: id } }, select: { id: true } });
  console.log('[properties:getById] exists in DB =', !!exists);
  if (!id) return res.status(400).json({ message: 'Invalid id' });

  try {
    const property = await propertyService.getPropertyById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get property' });
  }
};

export const createProperty = async (req, res) => {
  try {
    const r = req.body || {};
    const required = ['title','description','location','pricePerNight','bedroomCount','maxGuestCount','rating','hostId'];
    for (const f of required) {
      if (r[f] == null || r[f] === '') return res.status(400).json({ message: `Field ${f} is required` });
    }
    // bathroomCount допускаем под двумя ключами
    if (r.bathroomCount == null && r.bathRoomCount == null) {
      return res.status(400).json({ message: 'Field bathroomCount is required' });
    }

    const prop = await propertyService.createProperty(req.body);
    return res.status(201).json(prop);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to create property');
  }
};

export const updateProperty = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });

  try {
    const updated = await propertyService.updateProperty(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025' || error.code === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Failed to update property' });
  }
};
export const deleteProperty = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });

  try {
    await propertyService.deleteProperty(id);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025' || error.code === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Failed to delete property' });
  }
};