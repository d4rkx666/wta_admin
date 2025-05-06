export type ImageItem = {
   id: string;
   url: string;
   file?: File;
   isExisting?: boolean;
   isMarkedForDeletion?: boolean;
   isThumbnail?: boolean
 };