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
      {/* Light sky-blue overlay */}
      <div className="absolute inset-0" style={{
        background: variant === "light"
          ? "linear-gradient(135deg, hsla(200, 40%, 95%, 0.82), hsla(195, 50%, 90%, 0.88))"
          : "linear-gradient(135deg, hsla(200, 35%, 93%, 0.8), hsla(195, 45%, 88%, 0.86))",
      }} />
      {/* Subtle sky-blue mesh gradient */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 15% 20%, hsla(195, 80%, 70%, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 80%, hsla(210, 70%, 65%, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, hsla(200, 60%, 75%, 0.06) 0%, transparent 60%)
        `,
      }} />
    </div>
  );
};

export default LiquidBackground;
