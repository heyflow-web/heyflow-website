"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Field, { Input } from "@/components/ui/Field";

export default function AdminPasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 여부는 서버가 확인한다 (비밀번호는 화면 코드에 없다)
  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(Boolean(data.authenticated)))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: inputPassword }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setErrorMessage("");
      } else {
        setErrorMessage("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      }
    } catch {
      setErrorMessage("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    setInputPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fill flex items-center justify-center" role="status" aria-label="불러오는 중">
        <div className="w-8 h-8 border-[3px] border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 인증 완료 시 하위 페이지 렌더링 + 로그아웃 핸들러를 props로 주입
  if (isAuthenticated) {
    return <>{typeof children === "function" ? children({ handleLogout }) : children}</>;
  }

  return (
    <div className="min-h-screen bg-fill text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-sheet p-8">
        <h1 className="text-display font-bold text-ink">관리자 로그인</h1>
        <p className="text-body text-sub mt-2">체험단 지원자를 관리하려면 비밀번호를 입력해 주세요.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <Field label="비밀번호" error={errorMessage} controlId="admin-password">
            <div className="relative">
              <Input
                id="admin-password"
                aria-describedby={errorMessage ? "admin-password-error" : undefined}
                type={showPassword ? "text" : "password"}
                autoFocus
                autoComplete="current-password"
                placeholder="비밀번호 입력"
                value={inputPassword}
                invalid={Boolean(errorMessage)}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-2 rounded-control text-small font-semibold text-sub hover:text-ink cursor-pointer"
              >
                {showPassword ? "숨기기" : "보기"}
              </button>
            </div>
          </Field>

          <Button type="submit" size="lg" block disabled={isSubmitting}>
            {isSubmitting ? "확인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
}
