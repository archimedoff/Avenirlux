export function AuthDivider({
  label = "or continue with email",
  variant = "light",
}: {
  label?: string;
  variant?: "light" | "dark";
}) {
  return (
    <div className={`auth-divider ${variant === "dark" ? "auth-divider--dark" : ""}`} role="separator" aria-label={label}>
      <span className="auth-divider__line" aria-hidden />
      <span className="auth-divider__label">{label}</span>
      <span className="auth-divider__line" aria-hidden />
    </div>
  );
}
