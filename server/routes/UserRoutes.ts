import express from 'express';
import { getUserThumbnails, getSingleThumbnail } from '../controllers/UserController.js';
import { requireAuth } from '../middleware/Auth.js';

const UserRouter = express.Router();

// Route to get all thumbnails for the logged-in user
UserRouter.get('/thumbnails', requireAuth, getUserThumbnails);

// Route to get a specific thumbnail by ID
UserRouter.get('/thumbnails/:id', requireAuth, getSingleThumbnail);

export default UserRouter;
