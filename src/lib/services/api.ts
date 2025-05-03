
export async function call<T>(endpoint: string, data: T | null, hasHeader: boolean = true){

   const headers = new Headers(); 
   let body = undefined;
   if (hasHeader) {
      // If no data, we set the default 'Content-Type' header to 'application/json'
      if (!headers.has('Content-Type')) {
         headers.set('Content-Type', 'application/json');
         body = JSON.stringify(data);
      }
   }else{
      body = data as FormData
   }

   const response = await fetch('/api/v1'+endpoint, {
      method: 'POST',
      headers: headers,
      body: body,
   });

   return response

}