"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

import vertexShader from "./shader.vert";
import fragmentShader from "./shader.frag";

const PERLIN_NOISE =
  "https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png";

export function Orb({
  colors = ["#DBDCE0", "#ffffff"],
  getInputVolume,
  getOutputVolume,
}: {
  colors?: string[];
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
}) {
  return (
    <motion.div
      className="w-full h-full"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
        resize={{ scroll: false, offsetSize: true }}
      >
        <Scene
          colors={colors}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
        />
      </Canvas>
    </motion.div>
  );
}

function Scene({
  colors,
  getInputVolume,
  getOutputVolume,
}: {
  colors: string[];
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
}) {
  const { gl } = useThree();
  const circleRef = useRef() as any;
  const targetColor1Ref = useRef(new THREE.Color(colors[0]));
  const speedRef = useRef({
    target: 0.1,
    current: 0.1,
  });
  const targetColor2Ref = useRef(new THREE.Color(colors[1]));

  const perlinNoiseTexture = useTexture(PERLIN_NOISE);

  const offsets = useMemo(
    () => new Float32Array(7).map(() => Math.random() * Math.PI * 2),
    []
  );

  useEffect(() => {
    targetColor1Ref.current = new THREE.Color(colors[0]);
    targetColor2Ref.current = new THREE.Color(colors[1]);
  }, [colors]);

  useFrame((_, delta) => {
    if (!circleRef.current) return;

    const inputVolume = getInputVolume?.() ?? 0;
    const outputVolume = getOutputVolume?.() ?? 0;

    const speed = speedRef.current;
    speed.target = 0.1 + (1 - Math.pow(outputVolume - 1, 2)) * 0.9;
    if (speed.target > speed.current) {
      speed.current = speed.target;
    }
    speed.current += (speed.target - speed.current) * 0.1;

    const uniforms = circleRef.current.material.uniforms;
    uniforms.uTime.value += delta * 0.5;
    uniforms.uAnimation.value += delta * speed.current;
    uniforms.uInputVolume.value = inputVolume;
    uniforms.uOutputVolume.value = outputVolume;
    uniforms.uColor1.value.lerp(targetColor1Ref.current, 0.05);
    uniforms.uColor2.value.lerp(targetColor2Ref.current, 0.05);
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setTimeout(function () {
        gl.forceContextRestore();
      }, 1);
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
    };
  }, [gl]);

  const uniforms = useMemo(() => {
    perlinNoiseTexture.wrapS = THREE.RepeatWrapping;
    perlinNoiseTexture.wrapT = THREE.RepeatWrapping;
    return {
      uColor1: new THREE.Uniform(new THREE.Color(colors[0])),
      uColor2: new THREE.Uniform(new THREE.Color(colors[1])),
      uOffsets: { value: offsets },
      uPerlinTexture: new THREE.Uniform(perlinNoiseTexture),
      uTime: new THREE.Uniform(0),
      uAnimation: new THREE.Uniform(0),
      uInputVolume: new THREE.Uniform(0),
      uOutputVolume: new THREE.Uniform(0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perlinNoiseTexture]);

  return (
    <mesh ref={circleRef}>
      <circleGeometry args={[3.9, 64]} />
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
