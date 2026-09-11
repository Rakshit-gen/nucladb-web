"use client";

import { useEffect, useRef } from "react";

// Hero background: a grid of dots, each twinkling on its own random cycle
// (like https://codepen.io/FlorianHolly/pen/WNQwmwQ), colored across the
// cyan/violet/amber palette. The pointer casts a spotlight that grows and
// brightens the dots nearby. Raw WebGL2 fullscreen triangle, no
// mesh/geometry needed.
const VERT = `#version 300 es
void main() {
  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mouseStrength;
uniform float u_dpr;
out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  float cell = 26.0 * u_dpr;
  vec2 gp = gl_FragCoord.xy / cell;
  vec2 id = floor(gp);
  vec2 local = fract(gp) - 0.5;
  float dist = length(local);

  float rnd = hash21(id);
  float phase = rnd * 6.2831853;
  float speed = 0.6 + rnd * 0.9;
  float raw = sin(u_time * speed + phase) * 0.5 + 0.5;
  float twinkle = smoothstep(0.35, 1.0, raw) * 0.85 + 0.15;

  vec3 cyan = vec3(0.498, 0.890, 0.831);
  vec3 violet = vec3(0.655, 0.545, 0.980);
  vec3 amber = vec3(0.949, 0.784, 0.475);
  vec3 base = rnd < 0.55 ? mix(cyan, violet, rnd / 0.55) : mix(violet, amber, (rnd - 0.55) / 0.45);

  vec2 cellCenterPx = (id + 0.5) * cell;
  float distToMouse = length(cellCenterPx - u_mouse) / u_dpr;
  float spotlight = smoothstep(170.0, 0.0, distToMouse) * u_mouseStrength;

  float r = 0.1 + spotlight * 0.09;
  float dotMask = smoothstep(r, r - 0.05, dist);

  float brightness = twinkle * (0.55 + spotlight * 1.4);
  vec3 col = mix(base, amber, spotlight * 0.5) * brightness;

  fragColor = vec4(col * dotMask, dotMask * clamp(brightness, 0.0, 1.0));
}`;

export function HeroDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uMouseStrength = gl.getUniformLocation(program, "u_mouseStrength");
    const uDpr = gl.getUniformLocation(program, "u_dpr");

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, canvas.clientWidth * dpr);
      canvas.height = Math.max(1, canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const mouse = { x: -1000, y: -1000 };
    const mouseTarget = { x: -1000, y: -1000 };
    let strength = 0;
    let strengthTarget = 0;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const scale = canvas.width / rect.width;
      mouseTarget.x = (e.clientX - rect.left) * scale;
      mouseTarget.y = (rect.height - (e.clientY - rect.top)) * scale;
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      strengthTarget = inside ? 1 : 0;
    };
    const onLeave = () => {
      strengthTarget = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    const frame = () => {
      const t = reduced ? 4.0 : (performance.now() - start) / 1000;
      mouse.x += (mouseTarget.x - mouse.x) * 0.12;
      mouse.y += (mouseTarget.y - mouse.y) * 0.12;
      strength += (strengthTarget - strength) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uMouseStrength, strength);
      gl.uniform1f(uDpr, dpr);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
