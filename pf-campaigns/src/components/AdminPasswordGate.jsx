"use client";

import { useState, useEffect } from "react";

const ADMIN_STORAGE_KEY = "lounge_admin_session_auth";
const ADMIN_PASSWORD = "medi1111";

export default function AdminPasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 세션 스토리지에서 기존 인증 여부 확인
    try {
      const savedAuth = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
      } catch (err) {
        console.error(err);
      }
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    setInputPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 인증 완료 시 하위 페이지 렌더링 + 로그아웃 핸들러를 context 또는 props로 주입할 수도 있음
  if (isAuthenticated) {
    return <>{typeof children === "function" ? children({ handleLogout }) : children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#E0E3E7] relative">
        {/* Google Style Identity Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-blue-500/20 mb-4">
            L
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Lounge Console
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#202124]">
            체험단 라운지 관리자
          </h1>
          <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">
            구글 시트 연동 지원자 데이터 및 대시보드 관리를 위해
            <br />
            관리자 보안 비밀번호를 입력해 주세요.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#3C4043] ml-1">
              관리자 비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoFocus
                placeholder="비밀번호를 입력하세요"
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className={`w-full px-4 py-3.5 bg-white border ${
                  errorMessage ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#DADCE0] focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                } rounded-xl text-sm font-medium text-[#202124] placeholder-[#80868B] outline-none transition-all pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5F6368] hover:text-[#202124] p-1 cursor-pointer"
              >
                {showPassword ? "숨김" : "표시"}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1.5 ml-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>관리자 로그인</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-[#F1F3F4] text-center">
          <p className="text-[11px] text-[#80868B]">
            Google Material 3 System Architecture · Secured Session
          </p>
        </div>
      </div>
    </div>
  );
}
