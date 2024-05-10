import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useProgress, useTexture } from "@react-three/drei";

import { fragmentShader, vertexShader } from "./shaders";
import { motion } from "framer-motion";

export default function Waveform({ colors }: { colors: string[] }) {
  const { loaded } = useProgress();

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded === 0 ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas>
        <Scene colors={colors} />
      </Canvas>
    </motion.div>
  );
}

function Scene({ colors }: { colors: string[] }) {
  const { gl } = useThree();
  const planeRef = useRef() as any;
  const perlinNoiseTexture = useTexture("/perlin-noise.png");

  const targetColor1Ref = useRef(new THREE.Color(colors[0]));
  const targetColor2Ref = useRef(new THREE.Color(colors[1]));

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener(
      "webglcontextlost",
      function (event) {
        event.preventDefault();
        setTimeout(function () {
          gl.forceContextRestore();
        }, 1);
      },
      false
    );
  }, [gl]);

  useEffect(() => {
    targetColor1Ref.current = new THREE.Color(colors[0]);
    targetColor2Ref.current = new THREE.Color(colors[1]);
  }, [colors]);

  useEffect(() => {
    perlinNoiseTexture.wrapS = THREE.RepeatWrapping;
    perlinNoiseTexture.wrapT = THREE.RepeatWrapping;
    perlinNoiseTexture.repeat.set(4, 4);
  }, [perlinNoiseTexture]);

  useFrame(({ clock }) => {
    if (!planeRef.current) return;
    planeRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    planeRef.current.material.uniforms.uColor1.value.lerp(
      targetColor1Ref.current,
      0.05
    );
    planeRef.current.material.uniforms.uColor2.value.lerp(
      targetColor2Ref.current,
      0.05
    );
  });

  const uniforms = useMemo(() => {
    return {
      uTime: new THREE.Uniform(0),
      uAmplitude: new THREE.Uniform(0.6),
      uFrequency: new THREE.Uniform(1),
      uColor1: new THREE.Uniform(new THREE.Color(colors[0])),
      uColor2: new THREE.Uniform(new THREE.Color(colors[1])),
      uPerlinTexture: new THREE.Uniform(perlinNoiseTexture),
    };
  }, []);

  return (
    <mesh ref={planeRef} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 6, 128, 32]} />
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
