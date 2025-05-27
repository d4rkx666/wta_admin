import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getCloudinaryUrl(file_id:string, isPdf: boolean):Promise<string>{
   const url = cloudinary.url(file_id, {
      secure: true,
      sign_url: true,
      type: 'private',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1-hour expiry
      resource_type: isPdf ? 'raw' : "image",
   });

   return url;
}