import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./configs/db.js";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import Authrouter from  './routes/AuthRoutes.js';
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from './routes/UserRoutes.js';
declare module "express-session" {
    interface SessionData {
        isLoggedIn: boolean;
        userId: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }

}

// Start connecting early; API requests below also wait for this connection.
connectDB().catch((error) => console.error('Initial MongoDB connection failed:', error.message));
const app = express();

// Secure cookies need HTTPS, so only require them in production (Vercel).
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

// Middleware
app.set("trust proxy", 1);

const corsOptions = {
    origin: [
        "https://ai-thumbnail-4xwn.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60,
        collectionName: 'sessions',
    })
}));

app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

// Make sure MongoDB is connected before any API route runs, and answer with a
// clear error instead of crashing the serverless function if it isn't.
app.use('/api', async (req: Request, res: Response, next) => {
    try {
        await connectDB();
        next();
    } catch (error: any) {
        console.error('MongoDB connection error:', error.message);
        res.status(503).json({ success: false, message: 'Database is temporarily unavailable. Please try again.' });
    }
});

app.use('/api/auth', Authrouter )
app.use('/api/thumbnails', ThumbnailRouter)
app.use('/api/user', UserRouter)
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;