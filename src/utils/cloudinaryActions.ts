import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

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

export async function deleteMultiCloudinaryFiles(file_id:string[]):Promise<string>{
  console.log("deleting files")
  
  const result = await cloudinary.api.delete_resources(file_id, {
      type: 'private'
  });

  console.log(result)
  return result;
}

export async function insertFile(file:File, folder_idContract: string, pdf:boolean):Promise<string | null>{
try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stream_setup: UploadApiOptions = {
      folder: folder_idContract,
      resource_type: 'image',
      type: 'private',
    }

    if(pdf){
      stream_setup.resource_type = "raw"
      stream_setup.format = "pdf"
    }

    // eslint-disable-next-line
    const resp:any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream( stream_setup,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    if(!resp.public_id){
      return null;
    }
    console.log('Created successful:', resp);
    return resp.public_id;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateFile(file: File, publicId: string, isPdf: boolean) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadOptions: UploadApiOptions = {
      public_id: publicId,
      resource_type: isPdf ? 'raw' : 'image',
      type: 'private',
      overwrite: true,
      invalidate: true,
      ...(isPdf && { format: 'pdf' })
    };

    // eslint-disable-next-line
    const resp:any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    console.log('Update successful:', resp);
    return resp.public_id;
  } catch (error) {
    console.error('Update failed:', error);
    return false;
  }
}