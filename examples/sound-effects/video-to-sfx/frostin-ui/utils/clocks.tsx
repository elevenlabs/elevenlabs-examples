import {
  MotionValue,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import React from "react";
import { useScroll, useScrollDirection } from "../components/scroll";

export interface Clock {
  value: MotionValue<number>;
  setRate: (rate: number) => void;
}

export const useClock = ({ defaultValue = 0, rate = 1 } = {}): Clock => {
  const value = useMotionValue(defaultValue);
  const rateRef = React.useRef(rate);
  useAnimationFrame((_, delta) => {
    value.set(value.get() + delta * rateRef.current);
  });
  return {
    value,
    setRate: (rate: number) => {
      rateRef.current = rate;
    },
  };
};

export const useScrollAcceleratedClock = ({
  acceleration = 5,
}: {
  acceleration?: number;
} = {}): Clock => {
  const scroll = useScroll();
  const direction = useScrollDirection();
  const clock = useClock({ rate: 1 });
  const [baseRate, setBaseRate] = React.useState(1);

  React.useEffect(() => {
    if (direction === "up") {
      setBaseRate(-1);
    } else if (direction === "down") {
      setBaseRate(1);
    }
  }, [direction]);

  useMotionValueEvent(scroll.velocity.y, "change", (velocity) => {
    clock.setRate(baseRate + (velocity / 1000) * acceleration);
  });

  return clock;
};
