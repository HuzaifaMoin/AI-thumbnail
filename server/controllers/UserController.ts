import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import { deleteThumbnail, generateThumbnail, } from '../controllers/ThumbnailController.js';

export const getUserThumbnails = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;

        // If no user is found in the session, reject the request
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access. Please log in."
            });
        }

        // Find all thumbnails belonging to this user, sorted by newest first
        const thumbnails = await Thumbnail.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: thumbnails.length,
            data: thumbnails
        });

    } catch (error: any) {
        console.error("Failed to fetch user thumbnails:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve thumbnails.",
            error: error.message
        });
    }
}

export const getSingleThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Get thumbnail ID from URL params
        const { userId } = req.session; // Get logged-in user ID from session

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access. Please log in."
            });
        }

        // Find the thumbnail by its ID
        const thumbnail = await Thumbnail.findById(id);

        if (!thumbnail) {
            return res.status(404).json({
                success: false,
                message: "Thumbnail not found."
            });
        }

        // Security check: verification that this thumbnail belongs to the logged-in user [1]
        if (thumbnail.userId?.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden. You do not have permission to view this thumbnail."
            });
        }

        // Return the individual thumbnail data
        res.status(200).json({
            success: true,
            data: thumbnail
        });

    } catch (error: any) {
        console.error("Failed to fetch single thumbnail:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve thumbnail.",
            error: error.message
        });
    }
};