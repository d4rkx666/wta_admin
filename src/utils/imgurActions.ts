

export async function delete_img(id_img: string) {
   const response = await fetch(`https://api.imgur.com/3/image/${id_img}`, {
     method: 'DELETE',
     headers: {
       Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`, // Same Client-ID used for upload
     },
   });
 
   const data = await response.json();
   return data.success;
 }
 
 export async function insert_img(imgurFormData: FormData) {
   const imgurResponse = await fetch('https://api.imgur.com/3/image', {
     method: 'POST',
     headers: {
       Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
     },
     body: imgurFormData,
   });
 
   const data = await imgurResponse.json();
   return data;
 }