import { MotionValue } from "framer-motion";
import { ReactNode, createContext, useContext } from "react";

export interface LightContextApi {
  angle: number | MotionValue<number>;
}

export const DEFAULT_LIGHT_ANGLE = 30;

const LightContext = createContext<LightContextApi>({
  angle: DEFAULT_LIGHT_ANGLE,
});

export const LightProvider = ({
  angle = DEFAULT_LIGHT_ANGLE,
  children,
}: {
  angle: number | MotionValue<number>;
  children: ReactNode;
}) => {
  return (
    <LightContext.Provider value={{ angle }}>{children}</LightContext.Provider>
  );
};

export const useLight = () => useContext(LightContext);
