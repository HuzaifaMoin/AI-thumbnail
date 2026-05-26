import fs from 'fs';

const base = 'http://localhost:3000';
const cookieFile = 'cookies.txt';

(async () => {
  try {
    const email = `testuser+copilot_${Date.now()}@example.com`;
    const registerRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'Password123!'
      })
    });

    console.log('register status', registerRes.status);
    const registerBody = await registerRes.text();
    console.log('register body', registerBody);

    const setCookie = registerRes.headers.get('set-cookie');
    if (!setCookie) {
      console.error('No set-cookie returned; cannot continue');
      return;
    }

    const cookie = setCookie.split(';')[0];
    fs.writeFileSync(cookieFile, cookie);

    const generateRes = await fetch(`${base}/api/thumbnails/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie
      },
      body: JSON.stringify({
        title: 'Test Thumbnail',
        prompt: 'A bold tech thumbnail with neon accents',
        style: 'Tech/Futuristic',
        aspect_ratio: '16:9',
        color_scheme: 'neon',
        text_overlay: false
      })
    });

    console.log('generate status', generateRes.status);
    console.log(await generateRes.text());
  } catch (error) {
    console.error(error);
  }
})();
