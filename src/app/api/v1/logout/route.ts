import { cookies } from 'next/headers';

export async function POST() {
  try{
    const getCookies = await cookies();
    getCookies.delete('session');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }catch(error){
    console.error(error);
    return new Response(JSON.stringify({ success: false }));
  }
}