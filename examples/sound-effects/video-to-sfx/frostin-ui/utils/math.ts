export function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

export function toDegrees(radians: number) {
  return radians * (180 / Math.PI);
}

export const cos = (degrees: number) => {
  return Math.cos(toRadians(degrees));
};

export const sin = (degrees: number) => {
  return Math.sin(toRadians(degrees));
};

export const tan = (degrees: number) => {
  return Math.tan(toRadians(degrees));
};

export function toComponents(degrees: number) {
  return {
    x: cos(degrees),
    y: sin(degrees),
  };
}
