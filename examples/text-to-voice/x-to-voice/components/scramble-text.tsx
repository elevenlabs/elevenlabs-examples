import { useScramble } from "use-scramble";

export const ScrambleText = ({ text, loop = false }: {
  text: string;
  loop?: boolean;
}) => {
  const { ref, replay } = useScramble({
    text: text,
    tick: 3,
    speed: 0.6,
    ...(loop && {
      onAnimationEnd: () => {
        setTimeout(() => {
          replay();
        }, 1000);
      },
    }),
  });

  return <span ref={ref} />;
};

export default ScrambleText