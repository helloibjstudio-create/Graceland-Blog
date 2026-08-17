"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

/**
 * Slow-drifting neuron field behind the dark heroes: nodes wander, nearby nodes
 * link up, and the pointer gently attracts the ones around it.
 */
export default function NeuralField({ density = 0.00009 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    let running = true;
    const pointer = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(90, Math.max(28, width * height * density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.7,
      }));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // gentle pull toward the pointer
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 160 && dist > 0.5) {
          node.x += (dx / dist) * 0.35;
          node.y += (dy / dist) * 0.35;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > 130) continue;
          ctx.strokeStyle = `rgba(120, 208, 247, ${(1 - dist / 130) * 0.28})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        ctx.fillStyle = "rgba(160, 224, 255, .55)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    // Pause when the hero scrolls away — no cycles burned off-screen.
    const visibility = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !frame) frame = requestAnimationFrame(draw);
      if (!running && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    visibility.observe(canvas);

    seed();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", seed);
    window.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      visibility.disconnect();
      window.removeEventListener("resize", seed);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [density]);

  return <canvas className="neural-field" ref={canvasRef} aria-hidden="true" />;
}
