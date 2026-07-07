"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RADIUS = 1.15;
const BLUE = new THREE.Color("#0EA5E9");
const PINK = new THREE.Color("#EC4899");

function colorAt(x: number) {
  const t = THREE.MathUtils.clamp((x + RADIUS) / (RADIUS * 2), 0, 1);
  return BLUE.clone().lerp(PINK, t);
}

// Radial-gradient sprite so point nodes render as soft circles instead of
// the default square points.
function useDotTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const r = size / 2;
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.8, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);
}

// Deterministic pseudo-random generator (mulberry32) so particle layout
// generation stays a pure, side-effect-free function of its seed.
function createRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Orb() {
  const groupRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const dotTexture = useDotTexture();

  const { vertexPositions, vertexColors, edgePositions, edgeColors } =
    useMemo(() => {
      const geo = new THREE.IcosahedronGeometry(RADIUS, 3);
      const posAttr = geo.attributes.position;
      const count = posAttr.count;
      const vColors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const c = colorAt(posAttr.getX(i));
        vColors[i * 3] = c.r;
        vColors[i * 3 + 1] = c.g;
        vColors[i * 3 + 2] = c.b;
      }

      const edgesGeo = new THREE.EdgesGeometry(geo);
      const edgePos = edgesGeo.attributes.position;
      const edgeCount = edgePos.count;
      const eColors = new Float32Array(edgeCount * 3);
      for (let i = 0; i < edgeCount; i++) {
        const c = colorAt(edgePos.getX(i));
        eColors[i * 3] = c.r;
        eColors[i * 3 + 1] = c.g;
        eColors[i * 3 + 2] = c.b;
      }

      return {
        vertexPositions: posAttr.array.slice() as Float32Array,
        vertexColors: vColors,
        edgePositions: edgePos.array.slice() as Float32Array,
        edgeColors: eColors,
      };
    }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.12;
    target.current.x = state.pointer.y * 0.15;
    target.current.y = state.pointer.x * 0.25;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      target.current.x,
      0.04
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      target.current.y * 0.2,
      0.04
    );
  });

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[edgePositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[edgeColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.35} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[vertexPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[vertexColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          map={dotTexture}
          alphaTest={0.1}
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>
    </group>
  );
}

function AmbientDust({ count = 160 }) {
  const mesh = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rng = createRng(42);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() - 0.5) * 12;
      pos[i * 3 + 1] = (rng() - 0.5) * 8;
      pos[i * 3 + 2] = (rng() - 0.5) * 6 - 2;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#94a3b8"
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.4}
      />
    </points>
  );
}

export default function NeuralOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <AmbientDust />
      <Orb />
    </Canvas>
  );
}
