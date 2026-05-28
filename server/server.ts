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

await connectDB();
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://ai-thumbnail-lvgd.vercel.app/'],
    credentials: true,
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,},
    store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            ttl: 14 * 24 * 60 * 60,
            collectionName: 'sessions',
        
        })

        },
));

app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/auth', Authrouter )
app.use('/api/thumbnails', ThumbnailRouter)
app.use('/api/user', UserRouter)
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});