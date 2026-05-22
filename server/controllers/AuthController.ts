import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

// Extend Express Session interface to include user data
declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}

// ==========================================
// 1. USER REGISTRATION
// ==========================================
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    await newUser.save();

    // setting user data in session
    req.session.user = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email
    };

    return res.status(201).json({
      message: 'User registered and logged in successfully',
      user: req.session.user
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

// ==========================================
// 2. CONTROLLER FOR USER LOGIN
// ==========================================
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // setting user data in session
    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    return res.status(200).json({
      message: 'Login successful',
      user: req.session.user
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

// ==========================================
// 3. CONTROLLER FOR USER VERIFY
// ==========================================
export const verifyUser = async (req: Request, res: Response) => {
  try {
    // Check if user data exists in the active session
    if (!req.session || !req.session.user) {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'No active session found' 
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: req.session.user
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

// ==========================================
// 4. CONTROLLER FOR USER LOGOUT
// ==========================================
export const logoutUser = async (req: Request, res: Response) => {
  // Destroy the active session container
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Could not log out, please try again' 
      });
    }

    // Clear the client-side session cookie identifier
    res.clearCookie('connect.sid'); 
    return res.status(200).json({ message: 'Logout successful' });
  });
};
