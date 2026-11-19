import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Thumbnail from '../models/Thumbnail.js';
import { generateImage } from '../configs/ai.js';

/* ================= CLOUDINARY CONFIG ================= */

const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

const cloudinaryConfigured = Boolean(
  (cloudinaryKey && cloudinarySecret && cloudinaryName) || cloudinaryUrl
);

if (cloudinaryConfigured) {
  if (cloudinaryUrl) {
    cloudinary.config({ cloudinary_url: cloudinaryUrl });
  } else {
    cloudinary.config({
      cloud_name: cloudinaryName,
      api_key: cloudinaryKey,
      api_secret: cloudinarySecret,
    });
  }
}

/* ================= PROMPT LIBRARY ================= */

const stylePrompts = {
  'Bold & Graphic':
    'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
  'Tech/Futuristic':
    'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
  'Minimalist':
    'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
  'Photorealistic':
    'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
  'Illustrated':
    'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
};

const colorSchemeDescriptions = {
  vibrant: 'vibrant and energetic colors, high saturation, bold contrasts',
  sunset: 'warm sunset tones, orange pink and purple hues',
  forest: 'natural green tones, earthy calm palette',
  neon: 'neon glow effects, cyberpunk lighting',
  purple: 'purple dominant modern aesthetic',
  monochrome: 'black and white dramatic contrast',
  ocean: 'cool blue and teal tones',
  pastel: 'soft pastel airy colors',
};

// The image model returns a square image; tell it how the picture will be cropped
// so the important parts stay in frame.
const compositionHints = {
  '16:9': 'wide landscape composition, keep the main subject and any text inside the central horizontal band',
  '1:1': 'square composition, subject centered',
  '9:16': 'tall vertical composition, keep the main subject and any text inside the central vertical strip',
};

type Style = keyof typeof stylePrompts;
type ColorScheme = keyof typeof colorSchemeDescriptions;
type AspectRatio = keyof typeof compositionHints;

/* ================= HELPERS ================= */

// Only the owner of a thumbnail may view or delete it.
const findOwnThumbnail = async (req: Request) => {
  const userId = req.session.user?.id;
  if (!userId) return null;
  try {
    const thumbnail = await Thumbnail.findById(req.params.id);
    if (!thumbnail || thumbnail.userId?.toString() !== userId.toString()) return null;
    return thumbnail;
  } catch {
    return null; // invalid ObjectId
  }
};

/* ================= MAIN CONTROLLER ================= */

export const generateThumbnail = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    return;
  }

  const { title, prompt: user_prompt, color_scheme, text_overlay } = req.body;
  const style: Style = req.body.style in stylePrompts ? req.body.style : 'Bold & Graphic';
  const aspect_ratio: AspectRatio = req.body.aspect_ratio in compositionHints ? req.body.aspect_ratio : '16:9';

  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ success: false, message: 'Please enter a title or topic.' });
    return;
  }

  if (!cloudinaryConfigured) {
    res.status(500).json({ success: false, message: 'Image storage is not configured on the server.' });
    return;
  }

  /* ---------------- PROMPT BUILD ---------------- */
  let prompt = `Create a ${stylePrompts[style]} for a YouTube video titled: "${title.trim()}".`;

  if (color_scheme && color_scheme in colorSchemeDescriptions) {
    prompt += ` Use ${colorSchemeDescriptions[color_scheme as ColorScheme]} color scheme.`;
  }
  if (user_prompt) {
    prompt += ` Additional details: ${user_prompt}.`;
  }
  prompt += ` ${compositionHints[aspect_ratio]}. Make it highly clickable, professional, and visually stunning.`;

  const thumbnail = await Thumbnail.create({
    userId,
    title: title.trim(),
    prompt_used: prompt,
    user_prompt,
    style,
    aspect_ratio,
    color_scheme: color_scheme in colorSchemeDescriptions ? color_scheme : undefined,
    text_overlay,
    isGenerating: true,
  });

  try {
    /* ---------------- AI CALL ---------------- */
    const imageBuffer = await generateImage(prompt);

    /* ---------------- CLOUDINARY UPLOAD ----------------
       Upload straight from memory (Vercel's disk is read-only). */
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
      {
        folder: 'thumbnails',
        public_id: `thumbnail-${thumbnail._id}`,
        overwrite: true,
        resource_type: 'image',
      }
    );

    // The model returns a square image; shape it with a delivery transformation.
    // Wide: crop to 16:9 around the most important area. Tall: cropping a square
    // to 9:16 cuts off text, so keep the whole image on a blurred background.
    const transformation =
      aspect_ratio === '9:16'
        ? [
            // Blurred, stretched copy as the background...
            { width: 1024, height: 1820, crop: 'fill', effect: 'blur:2000' },
            // ...with the full square image on top, centered.
            { overlay: uploadResult.public_id.replace(/\//g, ':'), width: 1024, crop: 'scale' },
            { flags: 'layer_apply' },
          ]
        : [{ aspect_ratio, width: 1280, crop: 'fill', gravity: 'auto' }];

    const image_url = cloudinary.url(uploadResult.public_id, {
      secure: true,
      version: uploadResult.version,
      format: 'jpg',
      transformation,
    });

    thumbnail.image_url = image_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.status(200).json({
      success: true,
      message: 'Thumbnail generated successfully',
      image_url,
      thumbnail,
    });
  } catch (error: any) {
    console.error('Thumbnail generation failed:', error);
    // Don't leave a "generating" placeholder behind in My Generations.
    await Thumbnail.findByIdAndDelete(thumbnail._id).catch(() => {});

    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to generate the thumbnail. Please try again.',
    });
  }
};

/* ================= GET BY ID ================= */

export const getThumbnailById = async (req: Request, res: Response) => {
  const thumbnail = await findOwnThumbnail(req);

  if (!thumbnail) {
    return res.status(404).json({ success: false, message: 'Thumbnail not found' });
  }

  res.json({ success: true, thumbnail });
};

/* ================= DELETE ================= */

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const thumbnail = await findOwnThumbnail(req);

    if (!thumbnail) {
      return res.status(404).json({ success: false, message: 'Thumbnail not found' });
    }

    if (thumbnail.image_url && cloudinaryConfigured) {
      // New images are stored as thumbnails/thumbnail-<id>; older ones used a
      // timestamp name, which we can still read from the URL.
      const match = thumbnail.image_url.match(/(thumbnails\/thumbnail-[\w-]+)\.[a-z0-9]+$/i);
      const publicId = match ? match[1] : `thumbnails/thumbnail-${thumbnail._id}`;
      await cloudinary.uploader.destroy(publicId).catch((err) =>
        console.error('Cloudinary delete failed:', err?.message)
      );
    }

    await Thumbnail.findByIdAndDelete(thumbnail._id);

    res.json({ success: true, message: 'Thumbnail deleted successfully' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete thumbnail',
      error: error.message,
    });
  }
};
