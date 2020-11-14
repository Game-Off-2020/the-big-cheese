export class ImageUtil {
   static createImageFromBuffer(buffer: Buffer): Promise<HTMLImageElement> {
      return new Promise((resolve) => {
         const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
         const image = new Image();
         image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
         };
         image.src = url;
      });
   }
}
