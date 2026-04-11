"use client";

import React, { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { Maximize2, Minimize2 } from "lucide-react";

function Shirt({ color }: { color: string }) {
  const { scene } = useGLTF("/tshirt.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => {
            const cloned = mat.clone();
            (cloned as THREE.MeshStandardMaterial).color = new THREE.Color(color);
            (cloned as THREE.MeshStandardMaterial).needsUpdate = true;
            return cloned;
          });
        } else if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
          (mesh.material as THREE.MeshStandardMaterial).color = new THREE.Color(color);
          (mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      }
    });
  }, [scene, color]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} scale={0.5}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#fbbf24" wireframe />
    </mesh>
  );
}

export default function TshirtScene() {
  const [color, setColor] = useState("#ffffff");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden ${isFullscreen
        ? "h-screen w-screen bg-black"
        : "h-[500px] w-full rounded-xl border border-(--primary-gold)/30 bg-black"
        }`}
    >
      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/80 text-white transition hover:bg-zinc-800"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      {/* Color selector */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-3">
        <div className="flex gap-2 rounded-lg border border-white/5 bg-zinc-900/70 p-2 backdrop-blur-sm">
          <button
            onClick={() => setColor("#ffffff")}
            className={`h-8 w-8 rounded-full border-2 bg-white transition-transform hover:scale-110 ${color === "#ffffff" ? "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,.5)]" : "border-zinc-600"
              }`}
            title="White"
          />
          <button
            onClick={() => setColor("#111111")}
            className={`h-8 w-8 rounded-full border-2 bg-zinc-950 transition-transform hover:scale-110 ${color === "#111111" ? "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,.5)]" : "border-zinc-600"
              }`}
            title="Black"
          />
        </div>
        <span className="rounded bg-zinc-900/50 px-2 py-1 text-[11px] text-zinc-500 backdrop-blur-sm">
          Drag to rotate · Scroll to zoom
        </span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 50 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-3, 3, -3]} intensity={0.6} />
        <pointLight position={[0, -3, 2]} intensity={0.4} />

        <Suspense fallback={<Loader />}>
          <Shirt color={color} />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={3}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}
