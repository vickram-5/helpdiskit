import { useEffect, useRef } from "react";

interface LiquidBackgroundProps {
  variant?: "dark" | "light";
}

const LiquidBackground = ({ variant = "dark" }: LiquidBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const darkOrbs = [
      { x: 0.2, y: 0.3, r: 300, color: [320, 70, 45], vx: 0.0003, vy: 0.0002 },
      { x: 0.8, y: 0.2, r: 350, color: [270, 65, 40], vx: -0.0002, vy: 0.0003 },
      { x: 0.5, y: 0.7, r: 280, color: [180, 60, 40], vx: 0.0004, vy: -0.0002 },
      { x: 0.3, y: 0.8, r: 260, color: [45, 70, 45], vx: -0.0003, vy: -0.0001 },
      { x: 0.7, y: 0.5, r: 320, color: [150, 55, 35], vx: 0.0002, vy: 0.0004 },
      { x: 0.1, y: 0.6, r: 240, color: [200, 70, 50], vx: 0.0005, vy: 0.0001 },
    ];

    const lightOrbs = [
      { x: 0.15, y: 0.2, r: 350, color: [200, 85, 75], vx: 0.0002, vy: 0.0003 },
      { x: 0.8, y: 0.15, r: 300, color: [195, 90, 80], vx: -0.0003, vy: 0.0002 },
      { x: 0.5, y: 0.6, r: 320, color: [210, 80, 85], vx: 0.0004, vy: -0.0001 },
      { x: 0.3, y: 0.85, r: 280, color: [190, 75, 70], vx: -0.0002, vy: -0.0002 },
      { x: 0.75, y: 0.5, r: 340, color: [185, 95, 78], vx: 0.0003, vy: 0.0004 },
      { x: 0.1, y: 0.5, r: 260, color: [205, 70, 88], vx: 0.0005, vy: 0.0001 },
    ];

    const orbs = variant === "light" ? lightOrbs : darkOrbs;
    const bgColor = variant === "light" ? "hsl(0, 0%, 97%)" : "hsl(230, 25%, 4%)";
    const orbOpacity = variant === "light" ? 0.45 : 0.35;
    const orbMidOpacity = variant === "light" ? 0.18 : 0.12;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      time++;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const orb of orbs) {
        orb.x += orb.vx + Math.sin(time * 0.001 + orb.color[0]) * 0.0001;
        orb.y += orb.vy + Math.cos(time * 0.0012 + orb.color[0]) * 0.0001;

        if (orb.x < -0.1 || orb.x > 1.1) orb.vx *= -1;
        if (orb.y < -0.1 || orb.y > 1.1) orb.vy *= -1;

        const cx = orb.x * canvas.width;
        const cy = orb.y * canvas.height;
        const scale = Math.min(canvas.width, canvas.height) / 1000;
        const r = orb.r * scale;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `hsla(${orb.color[0]}, ${orb.color[1]}%, ${orb.color[2]}%, ${orbOpacity})`);
        grad.addColorStop(0.5, `hsla(${orb.color[0]}, ${orb.color[1]}%, ${orb.color[2]}%, ${orbMidOpacity})`);
        grad.addColorStop(1, `hsla(${orb.color[0]}, ${orb.color[1]}%, ${orb.color[2]}%, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [variant]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      />
      {variant === "dark" && (
        <div className="fixed inset-0 z-0 bg-background/60" />
      )}
    </>
  );
};

export default LiquidBackground;
