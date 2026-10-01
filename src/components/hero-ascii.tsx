"use client";

import { useEffect, useRef } from "react";

// ASCII flow field using NuclaDB's cyan and violet brand accents.
export function HeroAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animation = useRef({ time: 0, elapsed: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const hero = canvas?.closest("section");
    if (!canvas || !ctx || !hero) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let frame = 0;
    let last = 0;
    let time = animation.current.time;
    let elapsed = animation.current.elapsed;
    let strength = 0;
    let strengthTarget = 0;
    const waves: { x: number; y: number; born: number }[] = [];
    let width = 0;
    let height = 0;
    const pointer = { x: -2, y: -2 };
    const target = { x: -2, y: -2 };
    const glyphs = " .·:+*x#%@";
    const styles = getComputedStyle(hero);
    const rgb = (token: string) => {
      const hex = styles.getPropertyValue(token).trim().replace("#", "");
      return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
    };
    const cyan = rgb("--glow-cyan");
    const violet = rgb("--glow-violet");

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const cell = width < 700 ? 12 : 11;
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      for (let y = 0; y < height; y += cell) {
        for (let x = 0; x < width; x += cell) {
          const dx = (x - pointer.x * width) / height;
          const dy = (y - pointer.y * height) / height;
          const distance = Math.hypot(dx, dy);
          const influence = Math.exp(-distance * distance * 32) * strength;
          const twist = influence * 1.4;
          const nx = (x - width / 2) / height - dy * twist;
          const ny = (y - height / 2) / height + dx * twist;
          const r = Math.hypot(nx * 0.88, ny);
          const angle = Math.atan2(ny, nx);
          const warp = Math.sin(angle * 3 + time * 0.22 + r * 5) * 0.15;
          const flow = Math.sin((r + warp) * 18 - time * 0.5 + Math.sin(nx * 6 + ny * 4 + time * 0.18) * 2);
          const detail = Math.sin(nx * 27 + Math.sin(ny * 15 + time * 0.3) * 2) * 0.16;
          let ripple = influence * (0.32 + Math.sin(distance * 45 - elapsed * 4) * 0.2);
          for (const wave of waves) {
            const age = elapsed - wave.born;
            const waveDistance = Math.hypot((x - wave.x * width) / height, (y - wave.y * height) / height);
            const ring = waveDistance - age * 0.35;
            ripple += Math.exp(-ring * ring * 650) * Math.max(0, 1 - age / 2.5) * 0.65;
          }
          const value = Math.max(0, Math.min(0.99, (flow * 0.5 + 0.5) * 0.8 + detail + ripple));
          const center = Math.min(1, Math.max(0.3, (r - 0.08) * 3));
          const alpha = Math.min(0.92, (0.16 + value * 0.72) * center + influence * 0.2);
          const blend = (Math.sin(nx * 3 + ny * 2 + time * 0.12) * 0.5 + 0.5) * 0.5;
          const color = cyan.map((channel, index) => Math.round(channel + (violet[index] - channel) * blend));
          ctx.fillStyle = `rgba(${color.join(",")},${alpha})`;
          ctx.fillText(glyphs[Math.floor(value * glyphs.length)], x, y);
        }
      }
    }

    function loop(now: number) {
      if (reduced.matches || !visible || document.hidden) return;
      if (now - last > 30) {
        const delta = Math.min((now - (last || now)) / 1000, 0.08);
        elapsed += delta;
        // A fluid opening burst eases to ambient speed over roughly five seconds.
        const speed = 0.45 + 11 * Math.exp(-elapsed / 1.25);
        time += delta * speed;
        animation.current = { time, elapsed };
        strength += (strengthTarget - strength) * 0.14;
        while (waves.length && elapsed - waves[0].born > 2.5) waves.shift();
        last = now;
        pointer.x += (target.x - pointer.x) * 0.12;
        pointer.y += (target.y - pointer.y) * 0.12;
        draw();
      }
      frame = requestAnimationFrame(loop);
    }

    function sync() {
      cancelAnimationFrame(frame);
      last = 0;
      if (!reduced.matches && visible && !document.hidden) {
        frame = requestAnimationFrame(loop);
      }
    }

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }

    function onMove(event: PointerEvent) {
      if (!canvas || !width || !height) return;
      const rect = canvas.getBoundingClientRect();
      if (!strengthTarget) {
        pointer.x = (event.clientX - rect.left) / width;
        pointer.y = (event.clientY - rect.top) / height;
      }
      strengthTarget = 1;
      target.x = (event.clientX - rect.left) / width;
      target.y = (event.clientY - rect.top) / height;
    }
    function onLeave() { strengthTarget = 0; }
    function onPress(event: PointerEvent) {
      if ((event.target as Element).closest("a, button") || reduced.matches) return;
      onMove(event);
      waves.push({ x: target.x, y: target.y, born: elapsed });
      if (waves.length > 5) waves.shift();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersectionObserver.observe(canvas);
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    hero.addEventListener("pointerdown", onPress, { passive: true });
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    resize();
    sync();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("pointerdown", onPress);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
