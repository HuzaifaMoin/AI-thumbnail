import { 
  registerUser, 
  loginUser, 
  verifyUser, 
  logoutUser 
} from '../controllers/AuthController.js';
import { requireAuth } from '../middleware/Auth.js';
import express from 'express';

const Authrouter = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Handle user registration
Authrouter.post('/register', registerUser);

// Handle user login
Authrouter.post('/login', loginUser);

// ==========================================
// PROTECTED ROUTES (Requires Active Session)
// ==========================================

// Verify active session state
Authrouter.get('/verify', requireAuth, verifyUser);

// Terminate active session state
Authrouter.post('/logout', requireAuth, logoutUser);

export default Authrouter;