// import { Request, Response } from 'express';
// import Thumbnail from '../models/Thumbnail.js';
// import ai from '../configs/ai.js';
// import path from 'path';
// import fs from 'fs'; 
// import { v2 as cloudinary } from 'cloudinary';

// const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
// const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
// const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
// const cloudinaryUrl = process.env.CLOUDINARY_URL;

// const cloudinaryConfigured = Boolean(
//   (cloudinaryKey && cloudinarySecret && cloudinaryName) || cloudinaryUrl
// );
// if (cloudinaryConfigured) {
//   if (cloudinaryUrl) {
//     cloudinary.config({ cloudinary_url: cloudinaryUrl });
//   } else {
//     cloudinary.config({
//       cloud_name: cloudinaryName,
//       api_key: cloudinaryKey,
//       api_secret: cloudinarySecret,
//     });
//   }
// }


// const stylePrompts = {
//     'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
//     'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
//     'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
//     'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
//     'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
// };

// const colorSchemeDescriptions = {
//     vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
//     sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
//     forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
//     neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
//     purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
//     monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
//     ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
//     pastel: 'soft pastel colors, light and airy palette, gentle contrasts, whimsical and friendly mood'
// };

// export const generateThumbnail = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const userId = req.session.user?.id;
//         const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
        
//         if (!userId) {
//             res.status(401).json({
//                 success: false,
//                 message: 'Unauthorized. Please log in to generate a thumbnail.'
//             });
//             return;
//         }

//         const thumbnail = await Thumbnail.create({
//             userId,
//             title,
//             prompt_used: user_prompt,
//             user_prompt,
//             style,
//             aspect_ratio,
//             color_scheme,
//             text_overlay,
//             isGenerating: true
//         });

//         const generationConfig: any = {
//             numberOfImages: 1,
//             outputMimeType: 'image/png',
//             aspectRatio: aspect_ratio || '16:9',
//             guidanceScale: 7.5,
//         };

//         let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

//         if (color_scheme) {
//             prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
//         }

//         if (user_prompt) {
//             prompt += ` Additional details: ${user_prompt}.`;
//         }

//         prompt += ` The thumbnail should be visually stunning and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;
//         const model = 'models/gemini-3.1-flash-image';
//         console.log('Thumbnail generation using model:', model);
//         console.log('Thumbnail generation method: generateImages');

//         let response: any;

// try {
//   response = await ai.models.generateImages({
//     model: 'imagen-3.0-generate-002', // safer model
//     prompt,
//     config: generationConfig,
//   });
// } catch (err: any) {
//   console.error("Gemini/Image API failed:", err.message);

//   return res.status(500).json({
//     success: false,
//     message: "AI image generation failed. Try again later.",
//     error: err.message,
//   });
// }({
//             model,
//             prompt,
//             config: generationConfig,
//         });

//         const imageData = response?.generatedImages?.[0]?.image?.imageBytes;
//         if (!imageData) {
//             throw new Error('No image bytes were returned by the image generation API');
//         }

//         const finalBuffer = Buffer.from(imageData, 'base64');

//         const filename = `final-output-${Date.now()}.png`;
//         const filePath = path.join('images', filename);

//         // Ensure the workspace output directory exists
//         fs.mkdirSync('images', { recursive: true });

//         // FIXED BUG: Removed original quotes around 'filePath' to refer to the actual path variable
//         fs.writeFileSync(filePath, finalBuffer);

//         if (!cloudinaryConfigured) {
//             throw new Error('Missing Cloudinary configuration: set CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME');
//         }

//         const uploadResult = await cloudinary.uploader.upload(filePath, {
//             folder: 'thumbnails',
//             public_id: path.parse(filename).name,
//             overwrite: true,
//             resource_type: 'image'
//         });

//         thumbnail.image_url = uploadResult.secure_url;
//         thumbnail.isGenerating = false;
//         await thumbnail.save();

//         // Send the saved thumbnail and the resolved image URL to the client
//         res.status(200).json({
//             success: true,
//             message: "Thumbnail generated successfully on the free tier!",
//             image_url: uploadResult.secure_url,
//             thumbnail,
//         });

//         fs.unlinkSync(filePath);

//     } catch (error: any) {
//         console.error("Free-tier Image Generation Failed:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to generate thumbnail image.",
//             error: error.message
//         });
//     }
// };

// export const getThumbnailById = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const thumbnail = await Thumbnail.findById(id);
        


//         if (!thumbnail) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Thumbnail not found."
//             });
//         }

//         res.status(200).json({
//             success: true,
//             thumbnail,
//         });
//     } catch (error: any) {
//         console.error("Failed to fetch thumbnail:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch thumbnail.",
//             error: error.message
//         });
//     }
// };

// export const deleteThumbnail = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const thumbnail = await Thumbnail.findById(id);

//         if (!thumbnail) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Thumbnail not found."
//             });
//         }

//         // CHANGED: Delete the local asset file from your 'images' directory instead of Cloudinary
//         if (thumbnail.image_url) {
//             // Extracts 'final-output-xxx.png' from the saved path/URL string
//             const filename = path.basename(thumbnail.image_url); 
//             const filePath = path.join('images', filename);

//             // Verify the file physically exists on the disk before running un-link commands
//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }
//         }

//         // Delete the thumbnail from the database
//         await Thumbnail.findByIdAndDelete(id);

//         res.status(200).json({
//             success: true,
//             message: "Thumbnail deleted successfully."
//         });

//     } catch (error: any) {
//         console.error("Failed to delete thumbnail:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to delete thumbnail.",
//             error: error.message
//         });
//     }
// };

import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import ai from '../configs/ai.js';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

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

/* ================= MAIN CONTROLLER ================= */

export const generateThumbnail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.session.user?.id;

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    /* ---------------- AUTH CHECK ---------------- */
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
      return;
    }

    /* ---------------- DB CREATE ---------------- */
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    /* ---------------- PROMPT BUILD ---------------- */
    let prompt = `Create a ${
      stylePrompts[style as keyof typeof stylePrompts]
    } for: "${title}"`;

    if (color_scheme) {
      prompt += ` Use ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
    }

    if (user_prompt) {
      prompt += ` Additional details: ${user_prompt}.`;
    }

    prompt +=
      ' Make it highly clickable, professional, and visually stunning for YouTube thumbnails.';

    /* ---------------- AI CONFIG ---------------- */
    const generationConfig = {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: aspect_ratio || '16:9',
      guidanceScale: 7.5,
    };

    /* ---------------- AI CALL (SAFE) ---------------- */
    let response: any;

try {
  response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });
} catch (err: any) {
  console.error('AI generation failed:', err);

  thumbnail.isGenerating = false;
  await thumbnail.save();

  res.status(500).json({
    success: false,
    message: 'AI image generation failed.',
    error: err.message,
  });

  return;
}
    /* ---------------- IMAGE VALIDATION ---------------- */
const parts = response?.candidates?.[0]?.content?.parts || [];

const imagePart = parts.find(
  (part: any) => part.inlineData
);

const imageData = imagePart?.inlineData?.data;
    if (!imageData) {
      thumbnail.isGenerating = false;
      await thumbnail.save();

      res.status(500).json({
        success: false,
        message: 'No image returned from AI model.',
      });
      return;
    }

    /* ---------------- SAVE FILE ---------------- */
    const buffer = Buffer.from(imageData, 'base64');

    fs.mkdirSync('images', { recursive: true });

    const filename = `thumbnail-${Date.now()}.png`;
    const filePath = path.join('images', filename);

    fs.writeFileSync(filePath, buffer);

    /* ---------------- CLOUDINARY UPLOAD ---------------- */
    if (!cloudinaryConfigured) {
      throw new Error('Cloudinary not configured properly');
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: 'thumbnails',
      public_id: path.parse(filename).name,
      overwrite: true,
      resource_type: 'image',
    });

    /* ---------------- UPDATE DB ---------------- */
    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    /* ---------------- CLEANUP ---------------- */
    fs.unlinkSync(filePath);

    /* ---------------- RESPONSE ---------------- */
    res.status(200).json({
      success: true,
      message: 'Thumbnail generated successfully',
      image_url: uploadResult.secure_url,
      thumbnail,
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during thumbnail generation',
      error: error.message,
    });
  }
};

/* ================= GET BY ID ================= */

export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const thumbnail = await Thumbnail.findById(req.params.id);

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found',
      });
    }

    res.json({
      success: true,
      thumbnail,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch thumbnail',
      error: error.message,
    });
  }
};

/* ================= DELETE ================= */

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const thumbnail = await Thumbnail.findById(req.params.id);

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found',
      });
    }

    if (thumbnail.image_url) {
      const filename = path.basename(thumbnail.image_url);
      const filePath = path.join('images', filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Thumbnail.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Thumbnail deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete thumbnail',
      error: error.message,
    });
  }
};