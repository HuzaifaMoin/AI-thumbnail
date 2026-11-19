import dotenv from 'dotenv';

dotenv.config();

// Images come from Cloudflare Workers AI (FLUX.1 schnell). The free plan includes
// 10,000 neurons a day, which is roughly 150-200 thumbnails.
const MODEL = process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
const TIMEOUT_MS = 60000;

/**
 * Generate an image from a text prompt and return it as a Buffer.
 * FLUX schnell on Cloudflare always returns a 1024x1024 image; the caller crops it
 * to the requested aspect ratio.
 */
export async function generateImage(prompt: string): Promise<Buffer> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('Image generation is not configured (missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN).');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      // FLUX's prompt limit is 2048 characters.
      body: JSON.stringify({ prompt: prompt.slice(0, 2048), steps: 4 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  const data: any = await response.json().catch(() => null);

  if (!response.ok || !data?.success || !data?.result?.image) {
    const detail = data?.errors?.[0]?.message || `HTTP ${response.status}`;
    console.error('Cloudflare image generation failed:', detail);

    if (response.status === 429 || /limit|neurons|quota/i.test(detail)) {
      throw new Error('The free daily image limit has been reached. Please try again tomorrow.');
    }
    throw new Error('The image generator is busy right now. Please try again in a moment.');
  }

  return Buffer.from(data.result.image, 'base64');
}
