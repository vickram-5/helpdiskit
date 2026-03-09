interface LiquidBackgroundProps {
  variant?: "dark" | "light";
}

const LiquidBackground = ({ variant = "dark" }: LiquidBackgroundProps) => {
  return (
    <div className="fixed inset-0 z-0">
      {/* Office background image — pre-blurred via CSS filter (NOT backdrop-filter) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/office-bg.jpg')",
          filter: "blur(30px) saturate(1.4) brightness(1.05)",
          transform: "scale(1.1)", // prevent blur edge bleed
        }}
      />
      {/* Soft tinted overlay */}
      <div className="absolute inset-0" style={{
        background: variant === "light"
          ? "linear-gradient(160deg, hsla(210, 30%, 96%, 0.55), hsla(200, 25%, 92%, 0.5))"
          : "linear-gradient(160deg, hsla(210, 25%, 94%, 0.5), hsla(200, 20%, 90%, 0.45))",
      }} />
      {/* Ambient light blobs */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 20% 15%, hsla(200, 60%, 80%, 0.2) 0%, transparent 45%),
          radial-gradient(ellipse at 80% 85%, hsla(220, 50%, 75%, 0.15) 0%, transparent 45%),
          radial-gradient(ellipse at 55% 40%, hsla(195, 40%, 85%, 0.1) 0%, transparent 50%)
        `,
      }} />
    </div>
  );
};

export default LiquidBackground;
