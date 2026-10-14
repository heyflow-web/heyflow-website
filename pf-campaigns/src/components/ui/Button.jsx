"use client";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-strong disabled:bg-brand/40",
  secondary: "bg-fill text-ink-2 hover:bg-line disabled:text-faint",
  weak: "bg-brand-weak text-brand-strong hover:brightness-95 disabled:opacity-50",
  danger: "bg-danger text-white hover:bg-danger-strong disabled:bg-danger/40",
  dangerWeak: "bg-danger-weak text-danger-strong hover:brightness-95 disabled:opacity-50",
  ghost: "bg-transparent text-sub hover:bg-fill disabled:text-faint",
};

const SIZES = {
  sm: "h-9 px-3 text-small rounded-control gap-1.5",
  md: "h-11 px-4 text-body rounded-control gap-2",
  lg: "h-14 px-5 text-subtitle rounded-card gap-2",
};

// 버튼과 버튼처럼 보이는 링크(href가 있으면 <a>)를 같은 모양으로 그린다
export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  href,
  className = "",
  type = "button",
  children,
  ...rest
}) {
  const cls = `inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors active:scale-[0.98] disabled:cursor-default disabled:active:scale-100 cursor-pointer ${
    VARIANTS[variant] || VARIANTS.primary
  } ${SIZES[size] || SIZES.md} ${block ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
