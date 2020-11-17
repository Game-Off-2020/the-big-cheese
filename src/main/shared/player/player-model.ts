export interface Player {
   id: string;
   name: string;
   position: {
      x: number;
      y: number;
   };
   direction: {
      x: number;
      y: number;
   };
   //hp: number;
   // TODO: direction (left or right)
   // TODO: movement status (moving, standing or maybe jumping too)
}
