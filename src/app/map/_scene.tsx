"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { Entry, ObjectType } from "@/lib/types";
import { axesToVector, pearsonCorrelation } from "@/lib/utils";
import { pca3D } from "@/lib/pca";

const TYPE_HUE: Record<ObjectType, number> = {
  T1: 170,  // teal — 実体
  T2: 160,  // cyan-teal — 集合
  T3: 275,  // violet — 抽象
  T4: 340,  // rose — 事件
  T5: 320,  // magenta — 現象
  T6: 40,   // amber — 状態
  T7: 260,  // purple — 永続抽象
};

type Props = {
  entries: Entry[];
  onHover: (e: Entry | null) => void;
  onSelect: (e: Entry) => void;
  hoveredId: string | null;
  autoRotate: boolean;
  showLinks: boolean;
};

export default function Scene({ entries, onHover, onSelect, hoveredId, autoRotate, showLinks }: Props) {
  // Normalize PCA positions to fit in a sphere of radius ~3
  const { positions, edges } = useMemo(() => {
    if (entries.length < 2) return { positions: entries.map(() => [0,0,0] as [number,number,number]), edges: [] };

    const vecs = entries.map(e => axesToVector(e.axes12));
    const { positions: raw } = pca3D(vecs);

    // Find max abs value across all coords to scale uniformly (wider spread)
    let maxAbs = 0;
    for (const p of raw) for (const c of p) maxAbs = Math.max(maxAbs, Math.abs(c));
    const scale = maxAbs > 0 ? 5.5 / maxAbs : 1;
    const scaled = raw.map(p => p.map(c => c * scale) as [number, number, number]);

    // Compute similarity edges (Pearson > 0.6)
    const edges: { a: number; b: number; sim: number }[] = [];
    for (let i = 0; i < vecs.length; i++) {
      for (let j = i + 1; j < vecs.length; j++) {
        const r = pearsonCorrelation(vecs[i], vecs[j]);
        if (r > 0.6) edges.push({ a: i, b: j, sim: r });
      }
    }

    return { positions: scaled, edges };
  }, [entries]);

  return (
    <Canvas
      camera={{ position: [0, 2, 14], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0B0F1A"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[8, 8, 8]} intensity={0.9} />
      <pointLight position={[-8, -4, -6]} intensity={0.4} color="#A78BFA" />

      <Stars radius={80} depth={60} count={900} factor={5} fade speed={0.4} />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
        enableZoom
        enablePan={false}
        minDistance={4}
        maxDistance={28}
      />

      {/* Origin helper (subtle) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#1F2638" />
      </mesh>

      {/* Connection lines */}
      {showLinks && <ConnectionLines entries={entries} positions={positions} edges={edges} />}

      {/* Entries */}
      {entries.map((e, i) => (
        <EntryNode
          key={e.id}
          entry={e}
          position={positions[i]}
          isHovered={hoveredId === e.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </Canvas>
  );
}

function EntryNode({
  entry, position, isHovered, onHover, onSelect,
}: {
  entry: Entry;
  position: [number, number, number];
  isHovered: boolean;
  onHover: (e: Entry | null) => void;
  onSelect: (e: Entry) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const a = entry.axes12;
  const size = 0.08 + 0.055 * a.H;                        // 重力
  // 発光は差を大きく: B=0 → 0.15, B=10 → 2.95
  const emissiveIntensity = 0.15 + 0.28 * a.B;
  // 脈動は差を大きく: J=0 → 0.4rad/s, J=10 → 2.0rad/s (5倍差)
  const pulseSpeed = 0.4 + 0.16 * a.J;
  // 脈動振幅も差を広げる: J=0 → ±8%, J=10 → ±28%
  const pulseAmp = 0.08 + 0.02 * a.J;
  // 浮遊のオフセット: 軸ごとに個別の位相で ふわっと動く
  const bobSeed = position[0] * 3.1 + position[1] * 1.7 + position[2] * 2.3;
  const hue = TYPE_HUE[entry.type] ?? 180;

  const color = useMemo(() => new THREE.Color().setHSL(hue / 360, 0.65, 0.58), [hue]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      const pulse = 1 + Math.sin(t * pulseSpeed + bobSeed) * pulseAmp;
      meshRef.current.scale.setScalar(isHovered ? 2.2 : pulse);
    }
    if (glowRef.current) {
      // グローは本体と異なる周期で重なり合う
      const glowPulse = 1 + Math.sin(t * pulseSpeed * 0.55 + bobSeed * 1.3) * (0.18 + 0.025 * a.J);
      glowRef.current.scale.setScalar(isHovered ? 3.5 : glowPulse * 1.8);
    }
    if (groupRef.current) {
      // 浮遊: 各ノードが微妙に漂う (流動性ほど大きく)
      const bobAmp = 0.04 + 0.02 * (a.J / 10);
      const bobX = Math.sin(t * 0.6 + bobSeed) * bobAmp;
      const bobY = Math.cos(t * 0.5 + bobSeed * 1.4) * bobAmp;
      const bobZ = Math.sin(t * 0.7 + bobSeed * 0.8) * bobAmp;
      groupRef.current.position.set(position[0] + bobX, position[1] + bobY, position[2] + bobZ);
    }
  });

  // グロー透明度も B に応じて変化 (発光が強いほど halo も濃い)
  const glowOpacity = isHovered ? 0.32 : 0.04 + 0.03 * a.B;

  return (
    <group ref={groupRef} position={position}>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={glowOpacity} />
      </mesh>
      {/* Main body */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(entry);
          if (typeof document !== "undefined") document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
          if (typeof document !== "undefined") document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(entry);
        }}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      {/* Virtual species: wire frame ring */}
      {entry.isVirtual && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 1.5, 0.008, 8, 40]} />
          <meshBasicMaterial color="#A78BFA" />
        </mesh>
      )}
    </group>
  );
}

function ConnectionLines({
  entries, positions, edges,
}: {
  entries: Entry[];
  positions: [number, number, number][];
  edges: { a: number; b: number; sim: number }[];
}) {
  const geometries = useMemo(() => {
    return edges.map(({ a, b, sim }) => {
      const pa = positions[a];
      const pb = positions[b];
      const geom = new THREE.BufferGeometry();
      geom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([...pa, ...pb], 3)
      );
      return { geom, sim };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, positions, edges]);

  return (
    <group>
      {geometries.map(({ geom, sim }, i) => (
        <primitive
          key={i}
          object={new THREE.Line(
            geom,
            new THREE.LineBasicMaterial({
              color: "#5EEAD4",
              transparent: true,
              opacity: Math.max(0.05, (sim - 0.6) * 0.8),
            })
          )}
        />
      ))}
    </group>
  );
}
