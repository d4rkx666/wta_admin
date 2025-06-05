import { deleteSession } from '@/lib/auth';

export async function POST() {
  try{
    await deleteSession();

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