import express from 'express';
import { deleteThumbnail, generateThumbnail } from '../controllers/ThumbnailController.js';
import { requireAuth } from '../middleware/Auth.js';

const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate', requireAuth, generateThumbnail);
ThumbnailRouter.delete('/delete/:id', requireAuth, deleteThumbnail);

export default ThumbnailRouter;
