import { ImageResponse } from 'next/og';
import { getOpenGraphImage } from '~/lib/metadata';

export const runtime = 'edge';

export const alt = 'Samstöðin';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  // Get the uploaded image URL from database
  const uploadedImageUrl = await getOpenGraphImage();
  
  // If we have an uploaded image, redirect to it
  if (uploadedImageUrl) {
    // Return the uploaded image as base64 or fetch it
    const imageResponse = await fetch(uploadedImageUrl);
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    
    return new Response(imageArrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }
  
  // Fallback: Generate a default OpenGraph image
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              margin: 0,
              marginBottom: 24,
            }}
          >
            Samstöðin
          </h1>
          <p
            style={{
              fontSize: 32,
              margin: 0,
              opacity: 0.9,
            }}
          >
            Gerðu þig að áskrifanda
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}