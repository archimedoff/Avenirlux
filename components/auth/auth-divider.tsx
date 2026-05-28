export function AuthDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="auth-divider" role="separator" aria-label={label}>
      <span className="auth-divider__line" aria-hidden />
      <span className="auth-divider__label">{label}</span>
      <span className="auth-divider__line" aria-hidden />
    </div>
  );
}
