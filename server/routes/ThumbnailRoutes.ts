import express from 'express';
import { deleteThumbnail, generateThumbnail, getThumbnailById } from '../controllers/ThumbnailController.js';
import { requireAuth } from '../middleware/Auth.js';

const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate', requireAuth, generateThumbnail);
ThumbnailRouter.get('/:id', requireAuth, getThumbnailById);
ThumbnailRouter.delete('/delete/:id', requireAuth, deleteThumbnail);

export default ThumbnailRouter;
