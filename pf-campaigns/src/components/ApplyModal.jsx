"use client";

import { useState } from "react";

export default function ApplyModal({ campaign, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    blogUrl: "",
    schedule1: "",
    schedule2: "",
    schedule3: "",
    agreePrivacy: false,
    agreeRetention: false,
    agreeMission: false,
    agreeMarketing: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isAllAgreed =
    formData.agreePrivacy &&
    formData.agreeRetention &&
    formData.agreeMission &&
    formData.agreeMarketing;

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      agreePrivacy: checked,
      agreeRetention: checked,
      agreeMission: checked,
      agreeMarketing: checked,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.agreePrivacy ||
      !formData.agreeRetention ||
      !formData.agreeMission ||
      !formData.agreeMarketing
    ) {
      alert("모든 필수 동의 항목에 체크해 주세요.");
      return;
    }

    setIsSubmitting(true);

    const formattedBlogUrl =
      formData.blogUrl && !formData.blogUrl.startsWith("http")
        ? `https://${formData.blogUrl}`
        : formData.blogUrl;

    let formattedPhone = (formData.phone || "").trim();
    const digitsOnly = formattedPhone.replace(/[^0-9]/g, "");
    if (digitsOnly.length === 11 && !formattedPhone.includes("-")) {
      formattedPhone = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
    } else if (digitsOnly.length === 10 && !formattedPhone.includes("-")) {
      formattedPhone = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          ...formData,
          phone: formattedPhone,
          blogUrl: formattedBlogUrl,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setIsSuccess(true);
      } else {
        alert(result.error || "신청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 통신 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const missionText = campaign?.missions
    ? campaign.missions.join(" / ")
    : "14일 이내 업로드 / 1,500자+ / 사진 15장+ / 동영상 포함 가이드 준수";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
              {campaign?.category} 지원하기
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1">
              {campaign?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                캠페인 지원이 완료되었습니다!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                신청서 검토 후 조건에 부합하는 지원자분들께 순차적으로 개별 안내 연락을 드리겠습니다.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 text-white font-bold text-sm rounded-2xl shadow-md mt-4 cursor-pointer"
              >
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Q2. Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  1. 지원자 성함 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="성함을 입력하세요 (예: 홍길동)"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-sm"
                />
              </div>

              {/* Q3. Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  2. 휴대폰 번호 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="01012345678 또는 010-1234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-sm"
                />
              </div>

              {/* Q4. Blog URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  3. 지원자 블로그 주소 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="blogUrl"
                  required
                  placeholder="blog.naver.com/아이디 또는 https://..."
                  value={formData.blogUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-sm"
                />
              </div>

              {/* Q5. Schedules */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  4. 방문 가능한 일정 3가지 (1~3순위) <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 leading-tight">
                  원활한 예약 조율을 위해 방문 가능한 날짜와 시간대를 3순위까지 작성해 주세요!
                </p>
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    name="schedule1"
                    required
                    placeholder="1순위: 8월 1일 15~18시"
                    value={formData.schedule1}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-900"
                  />
                  <input
                    type="text"
                    name="schedule2"
                    required
                    placeholder="2순위: 8월 2일 18시"
                    value={formData.schedule2}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-900"
                  />
                  <input
                    type="text"
                    name="schedule3"
                    required
                    placeholder="3순위: 8월 7일 오전 10시"
                    value={formData.schedule3}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Agreements (Q1, Q6, Q7, Q8) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">필수 약관 동의</span>
                </div>

                {/* 전체 동의 버튼 */}
                <label className="flex items-center gap-3 cursor-pointer bg-slate-900 text-white p-3.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={isAllAgreed}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                  />
                  <span>[전체 동의] 모든 필수 약관에 한번에 동의합니다</span>
                </label>

                {/* Q1 */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <input
                    type="checkbox"
                    name="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-slate-900 focus:ring-0"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    <strong className="text-slate-900">[필수] 개인정보 수집 및 이용 동의</strong>
                    <br />
                    체험단 적격자 확인, 예약 안내 및 본인 확인 목적 (종료 후 3개월 보관)
                  </span>
                </label>

                {/* Q6 */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <input
                    type="checkbox"
                    name="agreeRetention"
                    checked={formData.agreeRetention}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-slate-900 focus:ring-0"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    <strong className="text-slate-900">[필수] 포스팅 6개월 유지 동의</strong>
                    <br />
                    작성 콘텐츠 6개월 유지 (미유지 시 시술비 전액 청구될 수 있음)
                  </span>
                </label>

                {/* Q7 Dynamic Mission Agreement */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                  <input
                    type="checkbox"
                    name="agreeMission"
                    checked={formData.agreeMission}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-slate-900 focus:ring-0"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong className="text-indigo-900">[필수] 리뷰 미션 가이드 준수 동의</strong>
                    <br />
                    <span className="text-[11px] text-indigo-700 font-semibold">{missionText}</span>
                  </span>
                </label>

                {/* Q8 */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <input
                    type="checkbox"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-slate-900 focus:ring-0"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    <strong className="text-slate-900">[필수] 마케팅 활용 및 2차 가공 동의</strong>
                    <br />
                    공식 블로그, SNS, 홈페이지 홍보 자료 및 부분 2차 가공 활용 동의
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                {isSubmitting ? "제출 처리 중..." : "신청서 제출하기"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
