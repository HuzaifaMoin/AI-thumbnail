import mongoose from 'mongoose';

// On Vercel every serverless instance starts cold. Share one connection promise so
// requests wait for it, and don't exit the process if it fails: the next request
// can retry instead of the whole function crashing.
let connectionPromise: Promise<typeof mongoose> | null = null;

mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));
mongoose.connection.on('disconnected', () => {
    connectionPromise = null;
});

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(process.env.MONGODB_URI as string, { serverSelectionTimeoutMS: 15000 })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    await connectionPromise;
    return mongoose.connection;
};

export default connectDB;
