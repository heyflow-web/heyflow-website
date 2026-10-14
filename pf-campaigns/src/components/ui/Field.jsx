"use client";

import { useId, cloneElement, isValidElement } from "react";

const CONTROL =
  "w-full bg-fill text-ink placeholder:text-faint rounded-control outline-none border border-transparent focus:border-brand focus:bg-white transition-colors";

const SIZE = {
  md: "h-12 px-4 text-body",
  sm: "h-10 px-3 text-small",
};

export function Input({ size = "md", invalid = false, className = "", ...rest }) {
  return (
    <input
      className={`${CONTROL} ${SIZE[size] || SIZE.md} ${invalid ? "border-danger focus:border-danger" : ""} ${className}`}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Textarea({ size = "md", className = "", ...rest }) {
  return (
    <textarea
      className={`${CONTROL} ${size === "sm" ? "px-3 py-2.5 text-small" : "px-4 py-3 text-body"} resize-none ${className}`}
      {...rest}
    />
  );
}

export function Select({ size = "md", className = "", children, ...rest }) {
  return (
    <select className={`${CONTROL} ${SIZE[size] || SIZE.md} pr-8 cursor-pointer ${className}`} {...rest}>
      {children}
    </select>
  );
}

// 라벨 + 입력칸 + 도움말/오류. 자식 입력칸에 id를 이어 붙여 라벨과 연결한다.
// 입력칸을 다른 요소로 감쌌다면 controlId로 그 입력칸의 id를 알려 준다.
export default function Field({ label, required = false, optional = false, hint, error, aside, controlId, children, className = "" }) {
  const autoId = useId();
  const id = controlId || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const control =
    !controlId && isValidElement(children)
      ? cloneElement(children, { id: children.props.id || id, "aria-describedby": describedBy })
      : children;
  const labelFor = controlId || (isValidElement(children) ? children.props.id || id : undefined);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={labelFor} className="text-small font-semibold text-ink-2">
            {label}
            {required && <span className="text-brand ml-1">*</span>}
            {optional && <span className="text-muted font-normal ml-1">(선택)</span>}
          </label>
          {aside && <span className="text-caption text-muted">{aside}</span>}
        </div>
      )}
      {hint && (
        <p id={hintId} className="text-caption text-sub">
          {hint}
        </p>
      )}
      {control}
      {error && (
        <p id={errorId} className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
