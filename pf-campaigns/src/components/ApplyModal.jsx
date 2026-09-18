"use client";

import { useState } from "react";

const TIME_SLOTS = [
  "10:00 (오전)",
  "10:30 (오전)",
  "11:00 (오전)",
  "11:30 (오전)",
  "12:00 (오후)",
  "14:00 (오후)",
  "14:30 (오후)",
  "15:00 (오후)",
  "15:30 (오후)",
  "16:00 (오후)",
  "16:30 (오후)",
  "17:00 (오후)",
  "17:30 (오후)",
  "18:00 (오후)",
  "18:30 (오후)",
  "19:00 (오후)",
];

export default function ApplyModal({ campaign, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    blogUrl: "",
    userNote: "",
    agreePrivacy: false,
    agreeRetention: false,
    agreeMission: false,
    agreeMarketing: false,
  });

  const [schedules, setSchedules] = useState([
    { date: "", time: "14:00 (오후)" },
    { date: "", time: "15:00 (오후)" },
    { date: "", time: "16:00 (오후)" },
  ]);

  const [imageList, setImageList] = useState([]);
  const [imageNote, setImageNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleScheduleChange = (index, field, value) => {
    setSchedules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const isPhotoRequired = Boolean(
    campaign?.title?.match(/흉터|문신|타투|켈로이드|제거|파인|함몰/) ||
    campaign?.description?.match(/흉터|문신|타투|켈로이드|제거|파인|함몰/) ||
    campaign?.category?.match(/흉터|문신|피부/)
  );

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (imageList.length + files.length > 3) {
      alert("이미지는 최대 3장까지 첨부할 수 있습니다.");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("5MB 이하의 이미지 파일만 첨부 가능합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageList((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            dataUrl: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idToRemove) => {
    setImageList((prev) => prev.filter((img) => img.id !== idToRemove));
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

    if (!schedules[0].date || !schedules[1].date || !schedules[2].date) {
      alert("1순위, 2순위, 3순위 방문 날짜를 달력에서 모두 선택해 주세요.");
      return;
    }

    if (isPhotoRequired && imageList.length === 0) {
      alert("흉터/문신 치료 캠페인은 상태 확인을 위해 1장 이상의 사진 첨부가 필요합니다.");
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
          schedule1: `${schedules[0].date} ${schedules[0].time}`,
          schedule2: `${schedules[1].date} ${schedules[1].time}`,
          schedule3: `${schedules[2].date} ${schedules[2].time}`,
          phone: formattedPhone,
          blogUrl: formattedBlogUrl,
          images: imageList.map((img) => img.dataUrl),
          imageNote: imageNote,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-x-hidden max-w-full">
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

              {/* Q5. Schedules (Calendar Date & Time Picker) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    4. 방문 가능한 희망 일정 3가지 (달력에서 선택) <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    원활한 병원 예약을 위해 방문이 가능한 날짜와 희망 시간대를 3순위까지 달력에서 꼭 선택해 주세요!
                  </p>
                </div>

                <div className="space-y-2.5 pt-0.5">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {idx + 1}순위 희망 일정
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          날짜 + 시간 선택
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Date Picker */}
                        <div className="relative">
                          <input
                            type="date"
                            min={getTodayString()}
                            required
                            value={schedules[idx].date}
                            onChange={(e) =>
                              handleScheduleChange(idx, "date", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs"
                          />
                        </div>

                        {/* Time Select */}
                        <select
                          required
                          value={schedules[idx].time}
                          onChange={(e) =>
                            handleScheduleChange(idx, "time", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
                        >
                          {TIME_SLOTS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Photo Upload for Scar / Tattoo / Medical treatment condition */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    5. 시술 부위(흉터/문신 등) 상태 사진 첨부{" "}
                    {isPhotoRequired ? (
                      <span className="text-rose-500">* (필수)</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(선택)</span>
                    )}
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">
                    {imageList.length}/3장
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  정확한 상담 및 시술 가능 여부 확인을 위해 시술을 원하시는 부위(흉터, 문신, 켈로이드 등)의 사진을 첨부해 주세요.
                </p>

                {/* Upload Button Box */}
                {imageList.length < 3 && (
                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100/70 rounded-2xl cursor-pointer transition-all text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center text-lg mb-1">
                      📸
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      사진 추가하기 (클릭 또는 파일 선택)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, WEBP (장당 최대 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Image Previews Grid */}
                {imageList.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {imageList.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100"
                      >
                        <img
                          src={img.dataUrl}
                          alt={`첨부 이미지 ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-md"
                          title="삭제"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[9px] font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Note for photo */}
                <input
                  type="text"
                  name="imageNote"
                  placeholder="부위/상태 설명 (예: 오른쪽 팔 흉터, 5cm 크기)"
                  value={imageNote}
                  onChange={(e) => setImageNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* 6. Applicant Remarks / Special Note (Optional) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  6. 전달사항 및 특이사항 <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <textarea
                  name="userNote"
                  rows={2}
                  placeholder="병원이나 진행팀에 전달하고 싶으신 메모나 특이사항이 있다면 자유롭게 남겨주세요."
                  value={formData.userNote}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-900 resize-none"
                />
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
