export interface SimplePoint { x: number, y: number }
export class MathUtil {
  public static RotateAroundPoint = (p: SimplePoint, angle: number, dist: number): SimplePoint => {
    angle *= Math.PI / -180; //converting deg to rad
    return {
      x: Math.cos(angle) * dist + p.x,
      y: Math.sin(angle) * dist + p.y
    }
  }
  public static Lerp = (a: number, b: number, t: number) => {
    return (1 - t) * a + t * b;
  }
  public static Map = (x:number, fromMin:number, fromMax:number, toMin:number, toMax:number) => {
    return toMin + ((x - fromMin) / (fromMax - fromMin)) * (toMax - toMin);
  }
  public static RandomRange = (min:number, max:number) => {
    return Math.random() * ((max-min)+1) + min;
  }
}
