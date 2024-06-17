import { useEffect, useState } from "react";
import { HTMLMotionProps, motion } from "framer-motion";

interface DelayedMountProps extends HTMLMotionProps<"div"> {
  delay: number; // Duration in milliseconds
  children: React.ReactNode;
}

/**
 * Mounts its children only after the provided duration has elapsed.
 */
export const DelayedMount: React.FC<DelayedMountProps> = ({
  delay,
  children,
  ...otherProps
}) => {
  const [shouldRender, setShouldRender] = useState(delay === 0 ? true : false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [delay]);

  return (
    <motion.div {...otherProps}>{shouldRender ? children : null}</motion.div>
  );
};
