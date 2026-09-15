"use client";

import { useState, useEffect } from "react";

const REQUIRED_PASSWORD = "medi20000";

export default function PasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if user has already unlocked session
    const authStatus = localStorage.getItem("salman_access_granted");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === REQUIRED_PASSWORD) {
      localStorage.setItem("salman_access_granted", "true");
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("비밀번호가 일치하지 않습니다. 다시 입력해 주세요.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-xl border border-slate-200/80 space-y-6 text-center animate-in fade-in zoom-in duration-200">
          
          {/* Lock Icon Header */}
          <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            🔒
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              비밀번호 인증
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              캠페인 정보 보호를 위해 접근 비밀번호 입력이 필요합니다.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
            <div className="space-y-1 text-left">
              <input
                type="password"
                required
                placeholder="비밀번호를 입력하세요"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-slate-900 transition-colors text-center tracking-widest font-mono"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 animate-pulse">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
            >
              입장하기
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
            체험단 라운지 보안 접속 시스템
          </div>

        </div>
      </div>
    );
  }

  return children;
}
