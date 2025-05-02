
export async function call<T>(endpoint: string, data: T | null){


   console.log("sending", data)
   const response = await fetch('/api/v1'+endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({data}),
   });

   return response

}