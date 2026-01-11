import * as amenityService from '../services/amenityService.js';
const prismaToHttp = (err, res, fallbackMsg) => {
  const code = err?.code;
  if (code === 'P2025') return res.status(404).json({ message: err?.meta?.cause || 'Not found' });
  if (err?.name === 'PrismaClientValidationError' || String(code || '').startsWith('P20')) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  return res.status(500).json({ message: fallbackMsg });
};
export const getAllAmenities = async (req, res) => {
  try {
    const amenities = await amenityService.getAllAmenities();
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await amenityService.getAmenityById(id);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }
    res.json(amenity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAmenity = async (req, res) => {
  try {
    if (!req.body || !req.body.name) return res.status(400).json({ message: 'Field name is required' });
    const amenity = await amenityService.createAmenity({ name: String(req.body.name) });
    return res.status(201).json(amenity);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to create amenity');
  }
};

export const updateAmenity = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    const amenity = await amenityService.updateAmenity(id, req.body);
    return res.json(amenity);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to update amenity');
  }
};

export const deleteAmenity = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    await amenityService.deleteAmenity(id);
    return res.json({ message: 'Amenity deleted' });
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to delete amenity');
  }
};