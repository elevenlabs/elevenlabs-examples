import { Spring } from "framer-motion";

export type SpringPresetFn = (overrides: Partial<Spring>) => Spring;

export const springs = {
  xxxslow: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 22.5,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
  xxslow: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 20,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
  xslow: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 17.5,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
  slow: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 15,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
  normal: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 12.5,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
  fast: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 10,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
  xfast: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 7.5,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
  xxfast: (overrides: Partial<Spring> = {}): Spring => ({
    type: "spring",
    mass: 0.1,
    damping: 5,
    stiffness: 100,
    restDelta: 0.0001,
    ...overrides,
  }),
};
