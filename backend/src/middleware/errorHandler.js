import { ZodError } from 'zod';
import { formatZodError } from '../validation.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', fields: formatZodError(err) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Body is not valid JSON' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}
