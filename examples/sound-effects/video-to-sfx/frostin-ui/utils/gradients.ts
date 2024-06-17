type Direction = "to-top" | "to-right" | "to-bottom" | "to-left";

const BASE_ROTATIONS = {
  "to-top": 0,
  "to-right": 90,
  "to-bottom": 180,
  "to-left": 270,
};

export interface LinearGradientParams {
  colors: string[];
  positions?: (number | string)[];
  direction?: Direction;
  rotate?: number;
}

const inferPositions = (length: number): number[] => {
  if (length < 2) throw new Error("Length must be at least 2");

  const positions: number[] = [];
  for (let i = 0; i < length; i++) {
    positions.push(i / (length - 1));
  }
  return positions;
};

export const gradients = {
  linear: ({
    direction = "to-right",
    colors,
    positions,
    rotate = 0,
  }: LinearGradientParams): string => {
    const baseRotation = BASE_ROTATIONS[direction];

    if (!positions || positions.length !== colors.length) {
      positions = inferPositions(colors.length);
    }

    const stops = positions.map(
      (p, i) => `${colors[i]} ${typeof p === "number" ? p * 100 + "%" : p}`
    );

    return `linear-gradient(${baseRotation + rotate}deg, ${stops.join(", ")})`;
  },
};
