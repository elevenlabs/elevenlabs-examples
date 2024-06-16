import { useEffect } from "react";
import { useMotionValue, MotionValue, isMotionValue } from "framer-motion";

export function useCoerceToMotionValue<T>(
  val: T | MotionValue<T>
): MotionValue<T> {
  const fallbackMotionVal = useMotionValue(
    isMotionValue(val) ? val.get() : val
  );

  useEffect(() => {
    if (!isMotionValue(val)) {
      fallbackMotionVal.set(val);
    }
  }, [val]);

  return isMotionValue(val) ? val : fallbackMotionVal;
}
