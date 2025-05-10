'use client';

import { useEffect, useState } from 'react';

export default function BackgroundLayout({ children }) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [attribution, setAttribution] = useState(null);

  useEffect(() => {
    async function fetchBackgroundImage() {
      try {
        const response = await fetch('/api/background-image');
        const data = await response.json();
        if (data.url) {
          setBackgroundImage(data.url);
          setAttribution(data.attribution);
        }
      } catch (error) {
        console.error('Error fetching background image:', error);
      }
    }

    fetchBackgroundImage();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      }}
    >
      <div className="min-h-screen">
        {children}
      </div>
      {attribution && (
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white text-sm opacity-70 hover:opacity-100 transition-opacity">
          Photo by{' '}
          <a
            href={`${attribution.link}?utm_source=email_verify&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-200"
          >
            {attribution.name}
          </a>{' '}
          on{' '}
          <a
            href="https://unsplash.com/?utm_source=email_verify&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-200"
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
} 