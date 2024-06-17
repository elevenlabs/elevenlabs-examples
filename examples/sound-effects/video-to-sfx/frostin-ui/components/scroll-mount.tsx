import { HTMLMotionProps, motion } from "framer-motion";
import * as React from "react";

export interface ScrollMountProps extends HTMLMotionProps<"div"> {
  topWithin?: string;
  rightWithin?: string;
  bottomWithin?: string;
  leftWithin?: string;
  once?: boolean;
}

/**
 * Mounts children only when they enter the viewport.
 */
export const ScrollMount = React.forwardRef<HTMLDivElement, ScrollMountProps>(
  (
    {
      topWithin = "0px",
      rightWithin = "0px",
      bottomWithin = "0px",
      leftWithin = "0px",
      once = false,
      children,
      ...otherProps
    },
    ref
  ) => {
    const docRef = React.useRef<Document | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useLayoutEffect(() => {
      docRef.current = window.document;
    }, []);

    return (
      <motion.div
        {...otherProps}
        ref={ref}
        onViewportEnter={() => setMounted(true)}
        onViewportLeave={() => setMounted(false)}
        viewport={{
          root: docRef as any,
          margin: `${bottomWithin} ${leftWithin} ${topWithin} ${rightWithin}`,
          amount: "some",
          once,
        }}
      >
        {mounted && children}
      </motion.div>
    );
  }
);
