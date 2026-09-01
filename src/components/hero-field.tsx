"use client";

import { useEffect, useRef } from "react";

const VERTEX_SRC = `#version 300 es
void main() {
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

// A vector-space scene: a dot-matrix floor receding into fog, with glowing
// beacons standing in for indexed points. Inspired by river.ai's dot-shaded
// raymarched hero, but an original scene, rendered as a single fullscreen
// fragment shader with no geometry buffers, no textures, no dependencies.
const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_reduced;

out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

const vec3 HUE_CYAN = vec3(0.498, 0.890, 0.831);
const vec3 HUE_VIOLET = vec3(0.655, 0.545, 0.980);
const vec3 HUE_AMBER = vec3(0.949, 0.784, 0.475);

vec3 beaconHue(int i) {
  int m = i - (i / 3) * 3;
  if (m == 0) return HUE_CYAN;
  if (m == 1) return HUE_VIOLET;
  return HUE_AMBER;
}

// Ten floating "resolved vector" beacons in real 3D world space, behind the
// camera's -z look direction. Index 0 is the nearest/brightest: the query
// the whole floor field is converging on.
const int BEACON_COUNT = 10;
const vec3 BEACONS[BEACON_COUNT] = vec3[BEACON_COUNT](
  vec3(1.35, 0.34, -2.7),
  vec3(2.55, 0.16, -4.1),
  vec3(0.35, 0.48, -3.5),
  vec3(-1.25, 0.22, -5.0),
  vec3(3.15, 0.58, -6.6),
  vec3(0.95, 0.12, -6.1),
  vec3(-0.35, 0.40, -7.6),
  vec3(1.95, 0.30, -8.6),
  vec3(-2.05, 0.52, -8.1),
  vec3(0.75, 0.66, -9.6)
);

// Perpendicular distance (and depth) from a camera ray to a 3D point,
// for closest-approach point-light glow with correct perspective falloff.
void closestApproach(vec3 ro, vec3 rd, vec3 target, out float dPerp, out float tc) {
  vec3 toTarget = target - ro;
  tc = max(dot(toTarget, rd), 0.0);
  vec3 closest = ro + rd * tc;
  dPerp = length(target - closest);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float t = u_reduced > 0.5 ? 0.0 : u_time;
  vec2 mouseNorm = u_reduced > 0.5 ? vec2(0.0) : u_mouse;

  // A raymarched-style camera looking down and forward across an
  // embedding-space floor grid that recedes into fog toward a horizon,
  // with real 3D perspective and lighting instead of a flat 2D diagram.
  vec3 ro = vec3(sin(t * 0.035) * 0.35, 1.35, 0.0);
  vec3 rd = normalize(vec3(uv.x, uv.y * 0.85 - 0.72, -1.4));

  float camYaw = mouseNorm.x * 0.16 + sin(t * 0.02) * 0.05;
  float cy = cos(camYaw);
  float sy = sin(camYaw);
  rd.xz = mat2(cy, -sy, sy, cy) * rd.xz;
  rd.y += mouseNorm.y * 0.04;
  rd = normalize(rd);

  vec3 fogColorFar = vec3(0.020, 0.028, 0.058);
  vec3 fogColorHorizon = vec3(0.10, 0.135, 0.165);
  vec3 skyDeep = vec3(0.006, 0.008, 0.020);

  vec3 col;
  float horizonGlow = exp(-abs(rd.y) * 26.0);

  if (rd.y < -0.001) {
    // Floor: analytic ray/plane intersection at y = 0.
    float tFloor = -ro.y / rd.y;
    vec3 world = ro + rd * tFloor;
    float fog = 1.0 - exp(-tFloor * 0.09);

    vec2 gw = world.xz;
    float warp1 = fbm(gw * 0.35 + vec2(t * 0.05, t * 0.02));
    float n = fbm(gw * 0.5 + warp1 * 0.8);

    float cellSize = 0.62;
    vec2 cellUv = fract(gw / cellSize) - 0.5;
    float dotBrightness = smoothstep(0.25, 0.85, n) * 0.7 + 0.12;
    float dotRadius = mix(0.05, 0.22, dotBrightness);
    float dotMask = 1.0 - smoothstep(dotRadius - 0.04, dotRadius, length(cellUv));
    vec3 dotColor = mix(HUE_VIOLET * 0.55, mix(HUE_CYAN, HUE_AMBER, warp1), dotBrightness);

    vec2 lineUv = abs(fract(gw / cellSize) - 0.5);
    float gridLine = (1.0 - smoothstep(0.0, 0.006, min(lineUv.x, lineUv.y) - 0.46)) * 0.14;

    vec3 floorColor = skyDeep + dotMask * dotColor * dotBrightness * 0.55 + gridLine * HUE_CYAN;
    col = mix(floorColor, mix(fogColorFar, fogColorHorizon, horizonGlow), clamp(fog, 0.0, 1.0));
  } else {
    // Sky: graded gradient, a warm horizon band, and a stable, camera-locked
    // star field (hashed off the ray direction, not screen space).
    col = mix(skyDeep, vec3(0.03, 0.036, 0.05), clamp(rd.y * 1.4, 0.0, 1.0));

    vec2 starCell = floor(rd.xy * 340.0);
    float starHash = hash(starCell);
    float starPresence = step(0.9935, starHash);
    float twinkle = 0.5 + 0.5 * sin(t * 1.6 + starHash * 80.0);
    col += vec3(0.9, 0.94, 1.0) * starPresence * twinkle * 0.7;
  }

  col += mix(HUE_AMBER, HUE_CYAN, 0.2) * horizonGlow * 0.16;

  // Beacons: perspective-correct point-light glow via closest-approach to
  // each pixel's camera ray, so distant beacons are naturally smaller/dimmer.
  for (int i = 0; i < BEACON_COUNT; i++) {
    float dPerp;
    float tc;
    closestApproach(ro, rd, BEACONS[i], dPerp, tc);
    if (tc <= 0.0) continue;
    float sizeFalloff = 55.0 + tc * tc * 3.2;
    float pulse = 0.65 + 0.35 * sin(t * 0.8 + float(i) * 1.7);
    vec3 hue = beaconHue(i);
    float isFocal = i == 0 ? 1.0 : 0.0;
    float glow = exp(-dPerp * dPerp * sizeFalloff) * pulse * mix(1.0, 1.7, isFocal);
    float core = exp(-dPerp * dPerp * sizeFalloff * 26.0) * mix(1.0, 2.2, isFocal);
    float depthFade = exp(-tc * 0.05);
    col += hue * glow * depthFade * 0.9;
    col += mix(hue, vec3(1.0), 0.7) * core * depthFade;
  }

  // Scene richness fades toward the upper-left, keeping the headline column
  // a calm, mostly-flat backdrop instead of fighting the simulation.
  float sceneVisibility = smoothstep(-1.05, -0.05, uv.x);
  vec3 calmBase = mix(skyDeep, vec3(0.028, 0.040, 0.078), clamp((uv.y + 1.0) * 0.5, 0.0, 1.0));
  col = mix(calmBase, col, mix(0.22, 1.0, sceneVisibility));

  float vig = smoothstep(1.55, 0.15, length(uv * vec2(0.72, 1.0)));
  col *= mix(0.5, 1.0, vig);

  // Filmic-ish roll-off so bright cores bloom softly instead of clipping,
  // followed by a small saturation lift so the palette reads rich, not gray.
  col = col / (1.0 + col * 0.7);
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, 1.22);
  col = pow(max(col, 0.0), vec3(0.9));

  float grain = hash(gl_FragCoord.xy + t * 60.0) * 0.024;
  col += grain - 0.012;

  fragColor = vec4(col, 1.0);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uReduced = gl.getUniformLocation(program, "u_reduced");

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedMotionQuery.matches;

    const mouse = { x: 0, y: 0 };
    const mouseTarget = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    let raf = 0;
    const start = performance.now();

    const renderFrame = (now: number) => {
      const t = (now - start) / 1000;
      mouse.x += (mouseTarget.x - mouse.x) * 0.05;
      mouse.y += (mouseTarget.y - mouse.y) * 0.05;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uReduced, reduced ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!reduced) raf = requestAnimationFrame(renderFrame);
    };

    raf = requestAnimationFrame(renderFrame);

    const onMotionChange = () => {
      reduced = reducedMotionQuery.matches;
      if (!reduced) {
        raf = requestAnimationFrame(renderFrame);
      } else {
        cancelAnimationFrame(raf);
        gl.uniform1f(uReduced, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
    reducedMotionQuery.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      reducedMotionQuery.removeEventListener("change", onMotionChange);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-950">
      {/* CSS fallback, visible until (or in place of, if WebGL is unavailable) the canvas paints */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 68% 78%, rgba(242,200,121,0.16), transparent 70%), radial-gradient(55% 45% at 72% 70%, rgba(127,227,212,0.20), transparent 70%), linear-gradient(180deg, #0c1226 0%, #070b1a 100%)",
        }}
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
