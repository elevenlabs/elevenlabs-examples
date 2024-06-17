import {
  HTMLMotionProps,
  SpringOptions,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useState,
  useEffect,
  useRef,
  useContext,
  createContext,
  useMemo,
  useCallback,
  ReactNode,
  useId,
} from "react";
import { motion } from "framer-motion";
import { MotionValue, useMotionValue, useVelocity } from "framer-motion";
import { Loose } from "../utils/types";

const SMOOTHING_SPRING = {
  mass: 0.01,
  damping: 2,
  stiffness: 100,
};

const useMousePosition = ({
  defaultX = -1000,
  defaultY = -1000,
}: { defaultX?: number; defaultY?: number } = {}) => {
  const x = useMotionValue(defaultX);
  const y = useMotionValue(defaultY);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    document.addEventListener("mousemove", listener);
    return () => document.removeEventListener("mousemove", listener);
  });

  return useMemo(
    () => ({
      x,
      y,
    }),
    [x, y]
  );
};

interface MouseContextApi {
  position: {
    x: MotionValue<number>;
    y: MotionValue<number>;
  };
  velocity: {
    x: MotionValue<number>;
    y: MotionValue<number>;
  };
  pushTarget: (target: MouseTargetInfo) => void;
  popTarget: (targetId: string) => void;
  activeTarget: MouseTargetInfo | undefined;
  targets: MouseTargetInfo[];
}

const MouseContext = createContext<MouseContextApi | null>(null);

export const useMouse = () => {
  const mouse = useContext(MouseContext);
  if (!mouse) {
    throw new Error("Cannot call useMouse outside of MouseProvider");
  }
  return mouse;
};

interface MouseTargetInfo {
  id: string;
  data: any;
}

export const MouseProvider = ({
  children,
  defaultX = -1000,
  defaultY = -1000,
}: {
  children: ReactNode;
  defaultX?: number;
  defaultY?: number;
}) => {
  const { x, y } = useMousePosition({ defaultX, defaultY });
  const xSpring = useSpring(x, SMOOTHING_SPRING);
  const velocityX = useVelocity(xSpring);
  const ySpring = useSpring(y, SMOOTHING_SPRING);
  const velocityY = useVelocity(ySpring);
  const [targets, setTargets] = useState<MouseTargetInfo[]>([]);

  const pushTarget = useCallback((target: MouseTargetInfo) => {
    setTargets((prev) => [...prev, target]);
  }, []);

  const popTarget = useCallback((id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeTarget = targets[targets.length - 1] as
    | MouseTargetInfo
    | undefined;

  const api = useMemo(
    () => ({
      position: {
        x,
        y,
      },
      velocity: {
        x: velocityX,
        y: velocityY,
      },
      pushTarget,
      popTarget,
      activeTarget,
      targets,
    }),
    [x, y, velocityX, velocityY, pushTarget, popTarget, activeTarget, targets]
  );

  return <MouseContext.Provider value={api}>{children}</MouseContext.Provider>;
};

interface MouseFollowerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode | ((mouse: MouseContextApi) => ReactNode);
  alignX?: Loose<"start" | "end" | "center">;
  alignY?: Loose<"start" | "end" | "center">;
}

const PERCENT_BY_ALIGNMENT: Record<string, string> = {
  start: "0%",
  center: "-50%",
  end: "-100%",
};

export const MouseFollower = ({
  children,
  alignX = "center",
  alignY = "center",
  ...otherProps
}: MouseFollowerProps) => {
  const mouse = useMouse();
  const transform = useTransform(
    [mouse.position.x, mouse.position.y],
    ([x, y]) =>
      `translateX(${x}px) translateY(${y}px) translateX(${
        PERCENT_BY_ALIGNMENT[alignX] || alignX
      }) translateY(${PERCENT_BY_ALIGNMENT[alignY] || alignY})`
  );

  return (
    <motion.div
      {...otherProps}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
        display: "inline-block",
        pointerEvents: "none",
        transform,
        ...otherProps.style,
      }}
    >
      {typeof children === "function" ? children(mouse) : children}
    </motion.div>
  );
};

interface MouseTargetProps extends HTMLMotionProps<"div"> {
  data: any;
}

export const MouseTarget = ({
  children,
  data = {},
  ...otherProps
}: MouseTargetProps) => {
  const id = useId();
  const ref = useRef(null);
  const mouse = useMouse();

  useEffect(() => {
    return () => mouse.popTarget(id);
  }, []);

  return (
    <motion.div
      ref={ref}
      {...otherProps}
      onMouseEnter={(e) => {
        mouse.pushTarget({ id, data });
        otherProps.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        mouse.popTarget(id);
        otherProps.onMouseLeave?.(e);
      }}
    >
      {children}
    </motion.div>
  );
};

export interface MouseSmoothingProps {
  position?: SpringOptions;
  velocity?: SpringOptions;
  children: React.ReactNode;
}

export const MouseSmoothing = ({
  position,
  velocity,
  children,
}: MouseSmoothingProps) => {
  const inherit = useMouse();
  const positionX = useSpring(inherit.position.x, position);
  const positionY = useSpring(inherit.position.y, position);
  const velocityX = useSpring(inherit.velocity.x, velocity);
  const velocityY = useSpring(inherit.velocity.y, velocity);

  const mouse = useMemo(
    () => ({
      ...inherit,
      position: {
        x: position ? positionX : inherit.position.x,
        y: position ? positionY : inherit.position.y,
      },
      velocity: {
        x: velocity ? velocityX : inherit.velocity.x,
        y: velocity ? velocityY : inherit.velocity.y,
      },
    }),
    [positionX, positionY, velocityX, velocityY, inherit, position, velocity]
  );

  return (
    <MouseContext.Provider value={mouse}>{children}</MouseContext.Provider>
  );
};
