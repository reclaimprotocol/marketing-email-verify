import { NextResponse } from 'next/server';

// Cache for storing the image URL and its expiry
let imageCache = {
  url: null,
  expiry: null,
  attribution: null
};

export async function GET() {
  try {
    console.log(imageCache.url , imageCache.expiry , Date.now() < imageCache.expiry);
    // Check if we have a valid cached image
    if (imageCache.url && imageCache.expiry && Date.now() < imageCache.expiry) {
      return NextResponse.json({ 
        url: imageCache.url,
        attribution: imageCache.attribution 
      });
    }

    // Fetch a random image from Unsplash
    const response = await fetch(
      'https://api.unsplash.com/photos/random?query=minimal&orientation=landscape',
      {
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch image from Unsplash');
    }

    const data = await response.json();
    const imageUrl = data.urls.regular;
    const attribution = {
      name: data.user.name,
      username: data.user.username,
      link: data.user.links.html
    };

    // Update cache with new image URL and set expiry to 8 hours from now
    imageCache = {
      url: imageUrl,
      expiry: Date.now() + (8 * 60 * 60 * 1000), // 8 hours in milliseconds
      attribution: attribution
    };

    return NextResponse.json({ 
      url: imageUrl,
      attribution: attribution
    });
  } catch (error) {
    console.error('Error fetching background image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch background image' },
      { status: 500 }
    );
  }
} 