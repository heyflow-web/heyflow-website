"use client";

import { useEffect, useId } from "react";

const WIDTHS = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

// 가운데 뜨는 창. sheet를 주면 모바일에서는 아래에서 올라오는 창이 된다.
// layer: 창이 겹칠 때 위에 올라갈 순서 (상세 패널 50 < 문자·삭제 60 < 알림 70 < 사진 80)
export default function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  sheet = false,
  layer = 60,
  dismissable = true,
  closeOnBackdrop = true,
  ariaLabel,
  children,
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open || !dismissable) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex justify-center ${sheet ? "items-end sm:items-center p-0 sm:p-4" : "items-center p-4"}`}
      style={{ zIndex: layer }}
      onClick={() => dismissable && closeOnBackdrop && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        className={`w-full ${WIDTHS[size] || WIDTHS.md} bg-white flex flex-col max-h-[90vh] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.16)] ${
          sheet ? "rounded-t-sheet sm:rounded-sheet" : "rounded-sheet max-w-[calc(100vw-2rem)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || dismissable) && (
          <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-2">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-title font-bold text-ink">
                  {title}
                </h2>
              )}
              {description && <p className="text-small text-sub mt-1">{description}</p>}
            </div>
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="w-9 h-9 -mr-2 -mt-1 shrink-0 rounded-full text-muted hover:bg-fill hover:text-ink flex items-center justify-center cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 pb-6 pt-2 flex items-center gap-2">{footer}</div>}
      </div>
    </div>
  );
}
