export function toDateUTCString(date: string){
   const splitted = date.split("-");
   const newDate = new Date(Date.UTC(Number(splitted[0]), Number(splitted[1]), Number(splitted[2])));
   return newDate.toLocaleDateString('en-US', { 
      timeZone: 'UTC', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
   });
}
