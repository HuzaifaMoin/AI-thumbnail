import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import ai from '../configs/ai.js';
import path from 'path';
import fs from 'fs'; 
import {v2 as cloudinary} from 'cloudinary';


const stylePrompts = {
    'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
};

const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, light and airy palette, gentle contrasts, whimsical and friendly mood'
};

export const generateThumbnail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.session;
        const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        });

        // CHANGED: Switched to Google's official free-tier image model
        const model = 'imagen-3.0-generate-002';

        // CHANGED: Simplified configuration structure to align with Imagen standards
        const generationConfig: any = {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspect_ratio || '16:9', 
        };

        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

        if (color_scheme) {
            prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
        }

        if (user_prompt) {
            prompt += ` Additional details: ${user_prompt}.`;
        }

        prompt += ` The thumbnail should be visually stunning and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;

        // Make the API call using the free tier model
        const response: any = await ai.models.generateContent({
            model,
            contents: [prompt],
            config: generationConfig
        });

        // Validate the structure safely across variations of the SDK response
        if (!response?.candidates?.[0]?.content?.parts?.[0]) {
            throw new Error('Unexpected response structure from free image model');
        }

        const parts = response.candidates[0].content.parts;
        let finalBuffer: Buffer | null = null;

        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64');
            }
        }

        if (!finalBuffer) {
            throw new Error('No image bytes were returned by the API');
        }

        const filename = `final-output-${Date.now()}.png`;
        const filePath = path.join('images', filename);

        // Ensure the workspace output directory exists
        fs.mkdirSync('images', { recursive: true });

        // FIXED BUG: Removed original quotes around 'filePath' to refer to the actual path variable
        fs.writeFileSync(filePath, finalBuffer);

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            folder: 'thumbnails',
            public_id: path.parse(filename).name,
            overwrite: true,
            resource_type: 'image'
        });

        thumbnail.image_url = uploadResult.secure_url;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        // OPTIONAL ENHANCEMENT: Send the success output data back to your client frontend
        res.status(200).json({
            success: true,
            message: "Thumbnail generated successfully on the free tier!",
            filePath: `/images/${filename}`

        });

        fs.unlinkSync(filePath);

    } catch (error: any) {
        console.error("Free-tier Image Generation Failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate thumbnail image.",
            error: error.message
        });
    }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const thumbnail = await Thumbnail.findById(id);

        if (!thumbnail) {
            return res.status(404).json({
                success: false,
                message: "Thumbnail not found."
            });
        }

        // CHANGED: Delete the local asset file from your 'images' directory instead of Cloudinary
        if (thumbnail.image_url) {
            // Extracts 'final-output-xxx.png' from the saved path/URL string
            const filename = path.basename(thumbnail.image_url); 
            const filePath = path.join('images', filename);

            // Verify the file physically exists on the disk before running un-link commands
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete the thumbnail from the database
        await Thumbnail.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Thumbnail deleted successfully."
        });

    } catch (error: any) {
        console.error("Failed to delete thumbnail:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete thumbnail.",
            error: error.message
        });
    }
};

