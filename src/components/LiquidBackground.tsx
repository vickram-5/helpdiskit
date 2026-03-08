interface LiquidBackgroundProps {
  variant?: "dark" | "light";
}

const LiquidBackground = ({ variant = "dark" }: LiquidBackgroundProps) => {
  return (
    <div className="fixed inset-0 z-0">
      {/* Office background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/office-bg.jpg')" }}
      />
      {/* Dark overlay with warm tint */}
      <div className="absolute inset-0" style={{
        background: variant === "light"
          ? "linear-gradient(135deg, hsla(20, 15%, 8%, 0.75), hsla(25, 12%, 6%, 0.85))"
          : "linear-gradient(135deg, hsla(20, 15%, 5%, 0.82), hsla(25, 12%, 3%, 0.9))",
      }} />
      {/* Subtle warm mesh gradient overlay */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 15% 20%, hsla(25, 80%, 45%, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 80%, hsla(30, 70%, 40%, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, hsla(20, 60%, 35%, 0.04) 0%, transparent 60%)
        `,
      }} />
    </div>
  );
};

export default LiquidBackground;
