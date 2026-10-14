"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Field, { Input, Select, Textarea } from "@/components/ui/Field";

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
    birthdate: "",
    phone: "",
    blogUrl: "",
    userNote: "",
    agreePrivacy: false,
    agreeRetention: false,
    agreeMission: false,
    agreeMarketing: false,
    agreeNoChange: false,
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

  const titleAndCategory = `${campaign?.title || ""} ${campaign?.category || ""} ${campaign?.offer || ""}`;
  const isExcludedFromRequired = titleAndCategory.match(/반영구|소형문신|명함크기|명함 크기/);
  const isPhotoRequired = !isExcludedFromRequired && Boolean(
    titleAndCategory.match(/흉터|켈로이드|무좀|발톱|함몰|파인|사마귀/)
  );

  const isAllAgreed =
    formData.agreePrivacy &&
    formData.agreeRetention &&
    formData.agreeMission &&
    formData.agreeMarketing &&
    formData.agreeNoChange;

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      agreePrivacy: checked,
      agreeRetention: checked,
      agreeMission: checked,
      agreeMarketing: checked,
      agreeNoChange: checked,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          try {
            const maxWidth = 800;
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
            resolve(compressedDataUrl);
          } catch (canvasErr) {
            resolve(rawDataUrl);
          }
        };
        img.onerror = () => {
          resolve(rawDataUrl);
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => {
        resolve("");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (imageList.length + files.length > 3) {
      alert("이미지는 최대 3장까지 첨부할 수 있습니다.");
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert("10MB 이하의 이미지 파일만 첨부 가능합니다.");
        return;
      }

      try {
        const compressedDataUrl = await compressImage(file);
        setImageList((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            dataUrl: compressedDataUrl,
          },
        ]);
      } catch (err) {
        console.error("이미지 압축 중 오류 발생:", err);
      }
    }
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
      !formData.agreeMarketing ||
      !formData.agreeNoChange
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

    if (!formData.userNote || !formData.userNote.trim()) {
      alert("지원동기를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    const formattedBlogUrl =
      formData.blogUrl && !formData.blogUrl.startsWith("http")
        ? `https://${formData.blogUrl}`
        : formData.blogUrl;

    const formattedPhone = (formData.phone || "").replace(/[^0-9]/g, "");

    const driveNameFormat = `${formData.name}님 (${campaign.hospital || ""})${campaign.category || ""} - ${campaign.title}`;

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          hospital: campaign.hospital || "",
          category: campaign.category || "",
          folderName: driveNameFormat,
          driveFileName: driveNameFormat,
          submittedAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
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

  const agreements = [
    { name: "agreePrivacy", title: "개인정보 수집 및 이용 동의", desc: "체험단 적격자 확인, 예약 안내 및 본인 확인 목적 (종료 후 3개월 보관)" },
    { name: "agreeRetention", title: "포스팅 6개월 유지 동의", desc: "작성 콘텐츠 6개월 유지 (미유지 시 시술비 전액 청구될 수 있음)" },
    { name: "agreeMission", title: "리뷰 미션 가이드 준수 동의", desc: missionText },
    { name: "agreeMarketing", title: "마케팅 활용 및 2차 가공 동의", desc: "공식 블로그, SNS, 홈페이지 홍보 자료 및 부분 2차 가공 활용 동의" },
    { name: "agreeNoChange", title: "예약 확정 후 일정 변경 불가 및 취소 시 대기자 이월 동의", desc: "예약 확정 후 변경 불가(취소만 가능)하며, 취소 시 다음 대기자에게 순서가 이월됨에 동의합니다." },
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sheet
      size="md"
      layer={50}
      closeOnBackdrop={false}
      ariaLabel="지원 완료"
      title={isSuccess ? undefined : "지원서 작성"}
      description={isSuccess ? undefined : campaign?.title}
    >
      {isSuccess ? (
        <div className="py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-weak text-brand flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-title font-bold text-ink mt-5">지원이 완료됐어요</h2>
          <p className="text-body text-sub mt-2">
            신청서를 검토한 뒤 조건에 맞는 분께
            <br />
            순서대로 따로 연락드릴게요.
          </p>
          <Button size="lg" block className="mt-8" onClick={onClose}>
            확인
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-7 pb-2">
          <Field label="이름" required>
            <Input name="name" required placeholder="홍길동" autoComplete="name" value={formData.name} onChange={handleChange} />
          </Field>

          <Field label="생년월일" required hint="주민번호 앞 6자리">
            <Input name="birthdate" required inputMode="numeric" placeholder="981225" value={formData.birthdate} onChange={handleChange} />
          </Field>

          <Field label="휴대폰 번호" required>
            <Input
              type="tel"
              name="phone"
              required
              inputMode="numeric"
              autoComplete="tel"
              placeholder="- 없이 숫자만 (01012345678)"
              value={formData.phone}
              onChange={handleChange}
            />
          </Field>

          <Field label="블로그 주소" required>
            <Input name="blogUrl" required placeholder="blog.naver.com/아이디" value={formData.blogUrl} onChange={handleChange} />
          </Field>

          {/* 희망 일정 3개 */}
          <fieldset className="space-y-3">
            <legend className="text-small font-semibold text-ink-2">
              방문 가능한 날짜 3개<span className="text-brand ml-1">*</span>
            </legend>
            <div className="rounded-control bg-danger-weak px-4 py-3 text-small text-ink-2">
              <p className="font-semibold text-danger-strong">예약이 확정되면 일정을 바꿀 수 없어요</p>
              <p className="mt-1 text-sub">
                일정 변경을 요청하면 예약이 취소되고 다음 대기자에게 순서가 넘어가요. 1~3순위 모두 실제로 갈 수 있는 날짜로 골라 주세요.
              </p>
            </div>
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="grid grid-cols-[3.5rem_1fr_1fr] items-center gap-2">
                <span className="text-small font-semibold text-sub">{idx + 1}순위</span>
                <Input
                  type="date"
                  size="sm"
                  min={getTodayString()}
                  required
                  aria-label={`${idx + 1}순위 날짜`}
                  value={schedules[idx].date}
                  onChange={(e) => handleScheduleChange(idx, "date", e.target.value)}
                />
                <Select
                  size="sm"
                  required
                  aria-label={`${idx + 1}순위 시간`}
                  value={schedules[idx].time}
                  onChange={(e) => handleScheduleChange(idx, "time", e.target.value)}
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </fieldset>

          {/* 시술 부위 사진 */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-small font-semibold text-ink-2">
                시술 부위 사진
                {isPhotoRequired ? <span className="text-brand ml-1">*</span> : <span className="text-muted font-normal ml-1">(선택)</span>}
              </p>
              <span className="text-caption text-muted">{imageList.length}/3장</span>
            </div>
            <p className="text-caption text-sub">상담과 시술 가능 여부 확인을 위해 흉터·문신·켈로이드 등 원하는 부위의 사진을 올려 주세요.</p>

            {imageList.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imageList.map((img, idx) => (
                  <div key={img.id} className="relative aspect-square rounded-control overflow-hidden bg-fill">
                    <img src={img.dataUrl} alt={`첨부 사진 ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      aria-label={`사진 ${idx + 1} 삭제`}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageList.length < 3 && (
              <label className="flex items-center justify-center gap-2 h-12 rounded-control border border-dashed border-faint text-small font-semibold text-sub hover:bg-fill-weak cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
                </svg>
                사진 추가 (최대 3장, 장당 10MB 이하)
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="sr-only" />
              </label>
            )}

            <Input
              size="sm"
              name="imageNote"
              aria-label="시술 부위 설명"
              placeholder="부위·상태 설명 (예: 오른쪽 팔 흉터, 5cm)"
              value={imageNote}
              onChange={(e) => setImageNote(e.target.value)}
            />
          </div>

          <Field label="지원동기" required>
            <Textarea
              name="userNote"
              required
              rows={3}
              placeholder="이번 캠페인에 지원하는 이유를 적어 주세요."
              value={formData.userNote}
              onChange={handleChange}
            />
          </Field>

          {/* 약관 동의 */}
          <fieldset className="space-y-1">
            <legend className="sr-only">약관 동의</legend>
            <label className="flex items-center gap-3 rounded-control bg-fill px-4 h-14 cursor-pointer">
              <input type="checkbox" checked={isAllAgreed} onChange={handleSelectAll} className="w-5 h-5 cursor-pointer accent-brand" />
              <span className="text-body font-semibold text-ink">필수 약관 전체 동의</span>
            </label>
            <ul className="pt-1">
              {agreements.map((a) => (
                <li key={a.name}>
                  <label className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={a.name}
                      checked={formData[a.name]}
                      onChange={handleChange}
                      className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer accent-brand"
                    />
                    <span className="min-w-0">
                      <span className="block text-small font-medium text-ink">[필수] {a.title}</span>
                      <span className="block text-caption text-sub mt-0.5">{a.desc}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="sticky -bottom-4 -mx-6 px-6 pt-3 pb-4 bg-white">
            <Button type="submit" size="lg" block disabled={isSubmitting}>
              {isSubmitting ? "제출하는 중..." : "지원서 제출"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
