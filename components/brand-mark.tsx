type BrandMarkProps = {
  size?: "sm" | "md";
  className?: string;
};

const sizes = {
  sm: "h-7 w-7 text-[0.625rem]",
  md: "h-8 w-8 text-[0.6875rem]",
};

export function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--luxury-ink)] font-display font-medium tracking-tight text-white shadow-[var(--shadow-sm)] ring-1 ring-black/10 ${sizes[size]} ${className}`}
      aria-hidden
    >
      A
    </span>
  );
}
