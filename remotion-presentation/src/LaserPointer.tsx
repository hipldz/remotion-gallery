import { useEffect, useRef, type RefObject } from "react";

/** 激光笔颜色：红为默认，Shift+L 轮换。 */
export const LASER_COLORS = [
  { name: "红", core: "#ff6b6b", glow: "255, 59, 48" },
  { name: "蓝", core: "#7fb2ff", glow: "74, 140, 255" },
  { name: "绿", core: "#5ee08a", glow: "52, 199, 123" },
] as const;

type TrailPoint = { x: number; y: number; t: number };
type Ripple = { x: number; y: number; t: number };

const TRAIL_MS = 380;
const RIPPLE_MS = 560;

/**
 * 画在镜头画面之上的指向层：激光点、拖尾、点击涟漪与聚光灯。
 * 全部走 canvas 和 CSS 变量，鼠标移动不触发 React 渲染。
 */
export function LaserPointer({
  host,
  laser,
  spotlight,
  colorIndex,
}: {
  host: RefObject<HTMLElement | null>;
  laser: boolean;
  spotlight: boolean;
  colorIndex: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const color = LASER_COLORS[colorIndex % LASER_COLORS.length];

  useEffect(() => {
    const element = canvas.current;
    const wrapper = layer.current;
    const target = host.current;
    if (!element || !wrapper || !target || (!laser && !spotlight)) return;

    const context = element.getContext("2d");
    if (!context) return;

    const trail: TrailPoint[] = [];
    const ripples: Ripple[] = [];
    let inside = false;
    let px = 0;
    let py = 0;
    let frame = 0;
    let resize = 0;
    let needsPaint = true;

    const fit = () => {
      const rect = target.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      if (rect.width === 0 || rect.height === 0) return;
      element.width = Math.round(rect.width * ratio);
      element.height = Math.round(rect.height * ratio);
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const toLocal = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const margin = 4;
      inside =
        x >= -margin &&
        y >= -margin &&
        x <= rect.width + margin &&
        y <= rect.height + margin;
      px = Math.min(Math.max(x, 0), rect.width);
      py = Math.min(Math.max(y, 0), rect.height);
      return { x: px, y: py, width: rect.width, height: rect.height };
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      // 指针静止且没有残影时不必重绘，省掉空闲时的整帧清屏。
      if (!needsPaint && trail.length === 0 && ripples.length === 0) return;
      needsPaint = trail.length > 0 || ripples.length > 0;
      const width = element.width / (window.devicePixelRatio || 1);
      const height = element.height / (window.devicePixelRatio || 1);
      const now = performance.now();
      context.clearRect(0, 0, width, height);

      if (spotlight && inside) {
        wrapper.style.setProperty("--rmp-x", `${px}px`);
        wrapper.style.setProperty("--rmp-y", `${py}px`);
        wrapper.style.setProperty("--rmp-on", "1");
      } else {
        wrapper.style.setProperty("--rmp-on", "0");
      }

      if (laser) {
        while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
        context.lineCap = "round";
        context.lineJoin = "round";
        for (let index = 1; index < trail.length; index += 1) {
          const from = trail[index - 1];
          const to = trail[index];
          const age = (now - to.t) / TRAIL_MS;
          const alpha = Math.max(0, 1 - age);
          if (alpha <= 0.02) continue;
          context.strokeStyle = `rgba(${color.glow}, ${alpha * 0.16})`;
          context.lineWidth = 2 + 13 * alpha;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
          context.strokeStyle = `rgba(${color.glow}, ${alpha * 0.5})`;
          context.lineWidth = 0.8 + 3 * alpha;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
        }

        if (inside) {
          const halo = context.createRadialGradient(px, py, 0, px, py, 38);
          halo.addColorStop(0, `rgba(${color.glow}, 0.55)`);
          halo.addColorStop(0.4, `rgba(${color.glow}, 0.2)`);
          halo.addColorStop(1, `rgba(${color.glow}, 0)`);
          context.fillStyle = halo;
          context.beginPath();
          context.arc(px, py, 38, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = color.core;
          context.beginPath();
          context.arc(px, py, 6.4, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = "rgba(255, 255, 255, 0.7)";
          context.lineWidth = 1;
          context.beginPath();
          context.arc(px, py, 7.6, 0, Math.PI * 2);
          context.stroke();
          context.fillStyle = "rgba(255, 255, 255, 0.95)";
          context.beginPath();
          context.arc(px, py, 2.4, 0, Math.PI * 2);
          context.fill();
        }
      }

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        const progress = (now - ripple.t) / RIPPLE_MS;
        if (progress >= 1) {
          ripples.splice(index, 1);
          continue;
        }
        const radius = 8 + progress * 44;
        context.strokeStyle = `rgba(${color.glow}, ${(1 - progress) * 0.75})`;
        context.lineWidth = 2.4 * (1 - progress) + 0.6;
        context.beginPath();
        context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        context.stroke();
      }
    };

    const onMove = (event: PointerEvent) => {
      const point = toLocal(event);
      needsPaint = true;
      if (!laser) return;
      trail.push({ x: point.x, y: point.y, t: performance.now() });
      if (trail.length > 90) trail.shift();
    };
    const onDown = (event: PointerEvent) => {
      if (!laser) return;
      const point = toLocal(event);
      if (!inside) return;
      needsPaint = true;
      ripples.push({ x: point.x, y: point.y, t: performance.now() });
    };
    const onLeave = () => {
      inside = false;
    };
    const onResize = () => {
      window.clearTimeout(resize);
      resize = window.setTimeout(fit, 80);
    };

    fit();
    frame = requestAnimationFrame(draw);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      wrapper.style.setProperty("--rmp-on", "0");
      if (context) context.clearRect(0, 0, element.width, element.height);
    };
  }, [host, laser, spotlight, color.glow]);

  return (
    <div
      ref={layer}
      className={`rmp-pointer${spotlight ? " rmp-pointer-spot" : ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvas} className="rmp-pointer-canvas" />
    </div>
  );
}
