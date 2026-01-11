import * as reviewService from '../services/reviewService.js';
const prismaToHttp = (err, res, fallbackMsg) => {
  const code = err?.code;
  if (code === 'P2025') return res.status(404).json({ message: err?.meta?.cause || 'Not found' });
  if (err?.name === 'PrismaClientValidationError' || String(code || '').startsWith('P20')) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  return res.status(500).json({ message: fallbackMsg });
};
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewById = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    const review = await reviewService.getReviewById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    return res.json(review);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to get review');
  }
};

export const createReview = async (req, res) => {
  try {
    const { rating, comment, userId, propertyId } = req.body ?? {};
    if (rating == null || comment == null || !String(comment).trim() || !userId || !propertyId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Invalid rating' });
    }
    const review = await reviewService.createReview({
      rating: Math.trunc(r),
      comment,
      userId,
      propertyId,
    });
    return res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to create review');
  }
};

export const updateReview = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    const data = { ...req.body };
    if (data.rating !== undefined) {
      const r = Number(data.rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: 'Invalid rating' });
      }
      data.rating = Math.trunc(r);
    }
    const review = await reviewService.updateReview(id, data);
    return res.json(review);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to update review');
  }
};
export const deleteReview = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    await reviewService.deleteReview(id);
    return res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to delete review');
  }
};