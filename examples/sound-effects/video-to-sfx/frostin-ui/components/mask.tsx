import { HTMLMotionProps, MotionValue, motion } from "framer-motion";
import { forwardRef } from "react";

type Direction = "to-top" | "to-right" | "to-bottom" | "to-left";

const BASE_ROTATIONS = {
  "to-top": 0,
  "to-right": 90,
  "to-bottom": 180,
  "to-left": 270,
};

interface LinearMaskParams {
  opacities?: number[];
  positions?: (number | string)[];
  direction?: Direction;
  rotate?: number;
}

interface CustomLinearMaskParams {
  opacityFn: (position: number) => number;
  stops?: number;
  direction?: Direction;
  rotate?: number;
}

interface CircleMaskParams {
  opacities?: number[];
  positions?: number[];
}

interface EllipseMaskParams {
  opacities?: number[];
  positions?: number[];
}

const inferPositions = (length: number): number[] => {
  if (length < 2) throw new Error("Length must be at least 2");

  const positions: number[] = [];
  for (let i = 0; i < length; i++) {
    positions.push(i / (length - 1));
  }
  return positions;
};

export const masks = {
  linear: ({
    direction = "to-right",
    opacities = [1, 0],
    positions,
    rotate = 0,
  }: LinearMaskParams): string => {
    const baseRotation = BASE_ROTATIONS[direction];

    if (!positions || positions.length !== opacities.length) {
      positions = inferPositions(opacities.length);
    }

    const stops = positions.map(
      (p, i) =>
        `rgba(255, 255, 255, ${opacities[i]}) ${
          typeof p === "number" ? p * 100 + "%" : p
        }`
    );

    return `linear-gradient(${baseRotation + rotate}deg, ${stops.join(", ")})`;
  },
  customLinear: ({
    opacityFn,
    stops = 10,
    direction = "to-right",
    rotate = 0,
  }: CustomLinearMaskParams) => {
    const baseRotation = BASE_ROTATIONS[direction];
    const positions = Array.from({ length: stops }, (_, i) => i / (stops - 1));
    const opacities = positions.map(opacityFn);
    const gradientStops = positions.map(
      (pos, index) => `rgba(255, 255, 255, ${opacities[index]}) ${pos * 100}%`
    );

    return `linear-gradient(${baseRotation + rotate}deg, ${gradientStops.join(
      ", "
    )})`;
  },
  circle: ({ opacities = [1, 0], positions }: CircleMaskParams): string => {
    if (!positions || positions.length !== opacities.length) {
      positions = inferPositions(opacities.length);
    }

    const stops = positions.map(
      (p, i) => `rgba(255, 255, 255, ${opacities[i]}) ${p * 100}%`
    );

    return `radial-gradient(closest-side circle, ${stops.join(", ")})`;
  },
  ellipse: ({ opacities = [1, 0], positions }: EllipseMaskParams): string => {
    if (!positions || positions.length !== opacities.length) {
      positions = inferPositions(opacities.length);
    }

    const stops = positions.map(
      (p, i) => `rgba(255, 255, 255, ${opacities[i]}) ${p * 100}%`
    );

    return `radial-gradient(closest-side, ${stops.join(", ")})`;
  },
};

export interface MaskProps extends HTMLMotionProps<"div"> {
  image: string | MotionValue<string>;
  size?: string | MotionValue<string>;
}

export const Mask = forwardRef<HTMLDivElement, MaskProps>(
  ({ image, size, ...props }, ref) => {
    return (
      <motion.div
        {...props}
        ref={ref}
        style={{
          maskImage: image,
          WebkitMaskImage: image,
          maskSize: size,
          WebkitMaskSize: size,
          // maskComposite: "intersect",
          // WebkitMaskComposite: "intersect",
          ...props.style,
        }}
      />
    );
  }
);
