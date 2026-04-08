declare module "astronomia/data/vsop87Bearth" {
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bjupiter" {
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bmars" {
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bmercury" {
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bneptune" {
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bsaturn" {
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Buranus" {
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bvenus" {
  const data: any;
  export default data;
}
declare module "astronomia/moonposition" {
  export function position(jde: number): {
    ra: number;
    dec: number;
    range: number;
  };
  export function parallax(distance: number): number;
  export const meanLongitude: (T: number) => number;
  const _default: any;
  export default _default;
}
declare module "astronomia/planetposition" {
  export class Planet {
    constructor(data: any);
    position(jde: number): { lon: number; lat: number; range: number };
    position2000(jde: number): { lon: number; lat: number; range: number };
  }
}
