"use client";

import { useEffect, useRef } from "react";

// Hero background: a regular lattice of dots standing upright like a curtain.
// Radial ripples travel through it — a query spreading to the points around
// it — and the pointer pushes a live dent into the field wherever it moves.
// Depth falls off toward the far edge. three.js is imported dynamically so it
// never lands in the server bundle.
export function HeroGrid() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const width = () => mount.clientWidth || 1;
      const height = () => mount.clientHeight || 1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width() / height(), 0.1, 100);
      camera.position.set(0, 0, 8.5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width(), height());
      mount.appendChild(renderer.domElement);

      const BASE_RY = 0.42;
      const group = new THREE.Group();
      group.rotation.set(-0.05, BASE_RY, 0);
      scene.add(group);

      // Soft round dot sprite, so points read as glowing dots not hard squares.
      const dotCanvas = document.createElement("canvas");
      dotCanvas.width = dotCanvas.height = 64;
      const dctx = dotCanvas.getContext("2d")!;
      const grad = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.35, "rgba(255,255,255,0.7)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      dctx.fillStyle = grad;
      dctx.fillRect(0, 0, 64, 64);
      const dotTex = new THREE.CanvasTexture(dotCanvas);

      const GX = 62;
      const GY = 38;
      const STEP = 0.3;
      const N = GX * GY;
      const halfW = ((GX - 1) * STEP) / 2;
      const halfH = ((GY - 1) * STEP) / 2;

      const base = new Float32Array(N * 2);
      const positions = new Float32Array(N * 3);
      const colors = new Float32Array(N * 3);
      const baseCol = new Float32Array(N * 3);
      const sparkle = new Float32Array(N); // per-point twinkle phase, 0 = none

      const CYAN = new THREE.Color(0x7fe3d4);
      const VIOLET = new THREE.Color(0xa78bfa);
      const AMBER = new THREE.Color(0xf2c879);
      const tmp = new THREE.Color();

      for (let iy = 0; iy < GY; iy++) {
        for (let ix = 0; ix < GX; ix++) {
          const i = iy * GX + ix;
          const px = ix * STEP - halfW;
          const py = iy * STEP - halfH;
          base[i * 2] = px;
          base[i * 2 + 1] = py;
          positions[i * 3] = px;
          positions[i * 3 + 1] = py;
          positions[i * 3 + 2] = 0;
          tmp.copy(CYAN).lerp(VIOLET, (ix / (GX - 1)) * 0.9 + 0.05);
          baseCol[i * 3] = tmp.r;
          baseCol[i * 3 + 1] = tmp.g;
          baseCol[i * 3 + 2] = tmp.b;
          sparkle[i] = Math.random() < 0.07 ? Math.random() * Math.PI * 2 : 0;
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.085,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, mat);
      group.add(points);

      // Ripple sources — a small pool, respawned at random points or on click.
      type Drop = { ox: number; oy: number; born: number };
      const RIPPLE_SPEED = 3.1;
      const RIPPLE_W = 0.9;
      const drops: Drop[] = [];
      const spawnDrop = (t: number, ox?: number, oy?: number) => {
        drops.push({
          ox: ox ?? (Math.random() - 0.5) * halfW * 1.5,
          oy: oy ?? (Math.random() - 0.5) * halfH * 1.5,
          born: t,
        });
        if (drops.length > 4) drops.shift();
      };

      // Pointer → live dent in the field.
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const localPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const invMat = new THREE.Matrix4();
      const hit = new THREE.Vector3();
      const cursor = { x: 0, y: 0 };
      const cursorTarget = { x: 0, y: 0 };
      let cursorStrength = 0;
      let cursorSeen = false;
      const parallax = { x: 0, y: 0 };

      const updateCursor = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width === 0) return;
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        parallax.x = ndc.x;
        parallax.y = ndc.y;
        raycaster.setFromCamera(ndc, camera);
        invMat.copy(group.matrixWorld).invert();
        const ray = raycaster.ray.clone().applyMatrix4(invMat);
        if (ray.intersectPlane(localPlane, hit)) {
          cursorTarget.x = hit.x;
          cursorTarget.y = hit.y;
          if (!cursorSeen) {
            cursor.x = hit.x;
            cursor.y = hit.y;
            cursorSeen = true;
          }
        }
      };
      const onMove = (e: PointerEvent) => {
        updateCursor(e);
        const rect = renderer.domElement.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        cursorStrength = inside ? 1 : cursorStrength;
      };
      const onLeave = () => {
        cursorStrength = 0;
      };
      const onDown = (e: PointerEvent) => {
        updateCursor(e);
        const rect = renderer.domElement.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          spawnDrop((performance.now() - start) / 1000, cursorTarget.x, cursorTarget.y);
        }
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      mount.addEventListener("pointerleave", onLeave, { passive: true });

      const resize = () => {
        camera.aspect = width() / height();
        camera.updateProjectionMatrix();
        renderer.setSize(width(), height());
      };
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      const sinRy = Math.sin(BASE_RY);
      const start = performance.now();
      let lastSpawn = -2;
      let raf = 0;

      const frame = () => {
        const t = reduced ? 6.5 : (performance.now() - start) / 1000;

        if (!reduced && t - lastSpawn > 3.2) {
          spawnDrop(t);
          lastSpawn = t;
        }
        if (reduced && drops.length === 0) drops.push({ ox: -halfW * 0.3, oy: halfH * 0.2, born: t - 1.5 });

        cursor.x += (cursorTarget.x - cursor.x) * 0.14;
        cursor.y += (cursorTarget.y - cursor.y) * 0.14;
        const cStr = cursorSeen ? cursorStrength : 0;

        for (let i = 0; i < N; i++) {
          const px = base[i * 2];
          const py = base[i * 2 + 1];

          let z = 0.1 * Math.sin(px * 0.55 + t * 0.7) + 0.08 * Math.sin(py * 0.7 - t * 0.5);

          for (let d = 0; d < drops.length; d++) {
            const drop = drops[d];
            const age = t - drop.born;
            if (age < 0) continue;
            const dist = Math.hypot(px - drop.ox, py - drop.oy);
            const off = dist - age * RIPPLE_SPEED;
            const envelope = Math.exp(-(off * off) / (2 * RIPPLE_W * RIPPLE_W));
            z += Math.cos(off * 1.8) * envelope * Math.exp(-age * 0.5) * 0.7;
          }

          // live pointer dent
          if (cStr > 0) {
            const cdx = px - cursor.x;
            const cdy = py - cursor.y;
            z += cStr * 1.15 * Math.exp(-(cdx * cdx + cdy * cdy) / 2.4);
          }

          const sp = sparkle[i];
          if (sp !== 0) z += 0.14 * (0.5 + 0.5 * Math.sin(t * 1.7 + sp));

          positions[i * 3 + 2] = z;

          // depth: far side of the tilted plane dims and fades
          const depth = THREE.MathUtils.clamp(0.5 + (px * sinRy) / (halfW * sinRy) * 0.42, 0.2, 1.15);

          const crest = Math.max(0, z);
          const k = depth * (0.6 + crest * 1.7) * 1.25;
          colors[i * 3] = baseCol[i * 3] * k + AMBER.r * crest * 0.45;
          colors[i * 3 + 1] = baseCol[i * 3 + 1] * k + AMBER.g * crest * 0.45;
          colors[i * 3 + 2] = baseCol[i * 3 + 2] * k + AMBER.b * crest * 0.45;
        }

        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;

        group.rotation.y = BASE_RY + Math.sin(t * 0.08) * 0.045 + parallax.x * 0.07;
        group.rotation.x = -0.05 + parallax.y * 0.045;

        renderer.render(scene, camera);
        if (!reduced) raf = requestAnimationFrame(frame);
      };
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        mount.removeEventListener("pointerleave", onLeave);
        ro.disconnect();
        geo.dispose();
        mat.dispose();
        dotTex.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
