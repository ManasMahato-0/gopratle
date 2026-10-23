import { Router } from 'express';
import mongoose from 'mongoose';
import { CATEGORIES } from '../constants.js';
import { Requirement, modelFor } from '../models/Requirement.js';
import { requirementSchema } from '../validation.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const data = requirementSchema.parse(req.body);
    const Model = modelFor[data.category];
    const doc = await Model.create(data);
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const filter = category ? { category } : {};

    const [items, total] = await Promise.all([
      Requirement.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Requirement.countDocuments(filter),
    ]);

    res.json({ data: items, page, limit, total });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const doc = await Requirement.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Requirement not found' });
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
});

export default router;
