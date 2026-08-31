import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Génère un chemin en zigzag entre deux points (saccades d'éclair). */
function boltPoints(start: THREE.Vector3, end: THREE.Vector3, segments = 26, jitter = 0.6) {
  const pts: THREE.Vector3[] = [start.clone()];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const p = start.clone().lerp(end, t);
    p.x += (Math.random() - 0.5) * jitter;
    p.z += (Math.random() - 0.5) * jitter;
    pts.push(p);
  }
  pts.push(end.clone());
  return pts;
}

function tube(points: THREE.Vector3[], radius: number, radial: number) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 80, radius, radial, false);
}

/**
 * Éclair 3D réel (WebGL) — cœur blanc chaud + halo orange additif,
 * branches, flicker et parallaxe au curseur.
 */
export function Lightning({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const group = new THREE.Group();
    scene.add(group);

    const ELECTRIC = new THREE.Color("#f7931a");
    const HOT = new THREE.Color("#fff6e8");

    const disposables: { dispose: () => void }[] = [];

    // Foudre principale
    const mainPts = boltPoints(new THREE.Vector3(0, 3.4, 0), new THREE.Vector3(0, -3.4, 0));
    const coreGeom = tube(mainPts, 0.05, 6);
    const coreMat = new THREE.MeshBasicMaterial({ color: HOT, transparent: true, opacity: 0.95 });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);
    disposables.push(coreGeom, coreMat);

    const glowGeom = tube(mainPts, 0.24, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: ELECTRIC,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    group.add(glow);
    disposables.push(glowGeom, glowMat);

    // Branches
    const branches: { mat: THREE.MeshBasicMaterial }[] = [];
    for (let i = 0; i < 5; i++) {
      const t = 0.2 + Math.random() * 0.6;
      const base = mainPts[Math.floor(t * (mainPts.length - 1))].clone();
      const tip = base
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 2.2,
            -1.1 - Math.random() * 0.9,
            (Math.random() - 0.5) * 1.4,
          ),
        );
      const pts = boltPoints(base, tip, 10, 0.28);
      const g = tube(pts, 0.025, 5);
      const m = new THREE.MeshBasicMaterial({ color: HOT, transparent: true, opacity: 0.85 });
      const mesh = new THREE.Mesh(g, m);
      group.add(mesh);
      disposables.push(g, m);
      branches.push({ mat: m });
    }

    const light = new THREE.PointLight(ELECTRIC, 40, 40);
    group.add(light);

    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const w = mount.clientWidth || 320;
      const h = mount.clientHeight || 320;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const flicker = 0.7 + Math.sin(t * 28) * 0.12 + Math.random() * 0.18;
      coreMat.opacity = Math.min(1, flicker);
      glowMat.opacity = 0.28 + flicker * 0.22;
      branches.forEach((b) => (b.mat.opacity = Math.min(1, flicker * 0.9)));
      group.rotation.y += (mouseX * 0.4 - group.rotation.y) * 0.05;
      group.rotation.x += (-mouseY * 0.32 - group.rotation.x) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (mount) mount.innerHTML = "";
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
