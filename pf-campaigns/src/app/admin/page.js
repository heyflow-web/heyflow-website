"use client";

import { useState, useEffect, useMemo } from "react";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import { formatBlogUrl, getDriveThumbnailUrl, getDrivePreviewUrl, getDriveFileId } from "@/lib/parser";

const getStatusStyle = (status) => {
  if (!status) return "bg-slate-100 text-slate-700 border-slate-200";
  if (status.includes("발행") || status.includes("완료")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status.includes("확정")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (status.includes("대기")) return "bg-amber-50 text-amber-800 border-amber-200";
  if (status.includes("취소") || status.includes("불가")) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const STATUS_OPTIONS = [
  { label: "대기중", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { label: "예약확정", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "방문완료", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "취소", color: "bg-rose-50 text-rose-700 border-rose-200" },
];

export default function AdminPage() {
  return (
    <AdminPasswordGate>
      {({ handleLogout }) => <AdminDashboard handleLogout={handleLogout} />}
    </AdminPasswordGate>
  );
}

function AdminDashboard({ handleLogout }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveSheet, setIsLiveSheet] = useState(false);
  const [isScriptOutdated, setIsScriptOutdated] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("전체");
  const [selectedHospital, setSelectedHospital] = useState("전체");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' | 'asc'
  const [activeItem, setActiveItem] = useState(null); // Side Sheet Drawer
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // 삭제 확인 모달 대상 지원서
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 진행 중 상태
  const [messageApplicant, setMessageApplicant] = useState(null); // 메시지 전송 대상 지원서
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("schedule"); // 'schedule' | 'confirm' | 'review' | 'custom'
  const [customMessageText, setCustomMessageText] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 1. 데이터 가져오기
  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/applications?refresh=${isManual ? "true" : "false"}`);
      const data = await res.json();

      if (data.success) {
        setApplications(data.applications || []);
        setIsLiveSheet(Boolean(data.isLiveSheet));
        setIsScriptOutdated(Boolean(data.isScriptOutdated));
        if (data.sheetUrl) setSheetUrl(data.sheetUrl);

        if (isManual) {
          showToast(data.isLiveSheet ? "구글 시트 최신 데이터를 불러왔습니다." : "데이터를 새로고침했습니다.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. 상태 및 메모 변경 핸들러
  const handleUpdateStatus = async (item, newStatus, confirmedDate = null) => {
    const targetDate = confirmedDate !== null ? confirmedDate : (item.confirmedDate || "");

    // 낙관적 UI 업데이트
    setApplications((prev) =>
      prev.map((app) =>
        app.rowId === item.rowId
          ? { ...app, status: newStatus, confirmedDate: targetDate }
          : app
      )
    );

    if (activeItem && activeItem.rowId === item.rowId) {
      setActiveItem((prev) => ({
        ...prev,
        status: newStatus,
        confirmedDate: targetDate,
      }));
    }

    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateRow",
          rowId: item.rowId,
          status: newStatus,
          confirmedDate: targetDate,
          memo: item.memo || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`[${item.name}님] 상태가 '${newStatus}'(으)로 변경되었습니다.`);
      }
    } catch (err) {
      console.error(err);
      showToast("상태 저장 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateMemo = async (item, newMemo) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.rowId === item.rowId ? { ...app, memo: newMemo } : app
      )
    );

    if (activeItem && activeItem.rowId === item.rowId) {
      setActiveItem((prev) => ({ ...prev, memo: newMemo }));
    }

    try {
      await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateRow",
          rowId: item.rowId,
          status: item.status,
          confirmedDate: item.confirmedDate || "",
          memo: newMemo,
        }),
      });
      showToast("메모가 저장되었습니다.");
    } catch (err) {
      console.error(err);
    }
  };

  // 3. 지원서 삭제 처리 (확인 모달 후 실행)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteRow",
          rowId: target.rowId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // 프론트엔드 목록에서 즉시 제거
        setApplications((prev) => prev.filter((app) => app.rowId !== target.rowId));
        if (activeItem && activeItem.rowId === target.rowId) {
          setActiveItem(null);
        }
        showToast(`[${target.name || "지원자"}님] 지원서가 성공적으로 삭제되었습니다.`);
      } else {
        showToast(data.message || "지원서 삭제 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("삭제 요청 실패:", err);
      showToast("삭제 통신 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // 4. 메시지 작성 및 발송 템플릿 로직
  const getTemplateMessage = (applicant, templateKey) => {
    if (!applicant) return "";
    const name = applicant.name || "지원자";
    const hospital = applicant.hospital || "체험단 라운지";
    const treatment = applicant.treatment || "시술";
    const schedule1 = applicant.schedule1 || (applicant.schedules && applicant.schedules[0]) || "일정 협의";
    const confirmedDate = applicant.confirmedDate || schedule1;

    switch (templateKey) {
      case "schedule":
        return `[체험단 라운지 - ${hospital}]
안녕하세요, ${name}님!
신청해주신 '${treatment}' 체험단에 선정되셨음을 안내드립니다. 🎉

■ 1지망 희망일정: ${schedule1}
■ 내원 및 시술 진행 일정을 조율하고자 하오니, 본 번호로 편하신 시간대 회신 부탁드립니다.

감사합니다.`;

      case "confirm":
        return `[체험단 라운지 - ${hospital}]
안녕하세요, ${name}님!
신청하신 체험단 예약 일정이 최종 확정되어 안내드립니다.

■ 예약 일시: ${confirmedDate}
■ 병원명: ${hospital}
■ 시술 항목: ${treatment}

※ 예약 시간 10분 전까지 내원 부탁드리며, 일정 변경이 필요하신 경우 최소 3일 전 미리 연락 바랍니다.
감사합니다.`;

      case "review":
        return `[체험단 라운지 - ${hospital}]
안녕하세요, ${name}님!
${hospital} 체험은 편안히 잘 받으셨나요?

■ 포스팅 마감: 내원일로부터 7일 이내
■ 안내사항: 전달드린 리뷰 가이드라인에 맞추어 솔직하고 정성스러운 후기 부탁드립니다.
■ 발행 완료 후 포스팅 URL 링크를 본 번호로 회신 부탁드립니다.

감사합니다.`;

      case "custom":
      default:
        return "";
    }
  };

  const handleOpenMessageModal = (applicant) => {
    setMessageApplicant(applicant);
    const defaultKey = applicant.confirmedDate ? "confirm" : "schedule";
    setSelectedTemplateKey(defaultKey);
    setCustomMessageText(getTemplateMessage(applicant, defaultKey));
    setCopiedMessage(false);
  };

  const handleSelectTemplate = (key) => {
    setSelectedTemplateKey(key);
    if (key === "custom") {
      setCustomMessageText("");
    } else {
      setCustomMessageText(getTemplateMessage(messageApplicant, key));
    }
  };

  // 병원 목록 고유값 추출
  const hospitalOptions = useMemo(() => {
    const set = new Set();
    applications.forEach((app) => {
      if (app.hospital && app.hospital !== "병원 미지정") set.add(app.hospital);
    });
    return ["전체", ...Array.from(set)];
  }, [applications]);

  // 필터링 및 검색
  const filteredApplications = useMemo(() => {
    return applications
      .filter((item) => {
        // 상태 필터
        if (selectedStatusTab !== "전체" && item.status !== selectedStatusTab) {
          return false;
        }
        // 병원 필터
        if (selectedHospital !== "전체" && item.hospital !== selectedHospital) {
          return false;
        }
        // 검색어 필터 (이름, 연락처, 병원, 시술, 블로그)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const targetStr = `${item.name} ${item.phone} ${item.rawPhone} ${item.hospital} ${item.treatment} ${item.blogUrl} ${item.userNote}`.toLowerCase();
          if (!targetStr.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.submittedAt || 0).getTime();
        const timeB = new Date(b.submittedAt || 0).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [applications, selectedStatusTab, selectedHospital, searchQuery, sortOrder]);

  // KPI 통계 계산
  const metrics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "대기중").length;
    const confirmed = applications.filter((a) => a.status === "예약확정").length;
    const completed = applications.filter((a) => a.status === "방문완료").length;
    const canceled = applications.filter((a) => a.status === "취소").length;
    return { total, pending, confirmed, completed, canceled };
  }, [applications]);

  // 전화번호 복사
  const copyToClipboard = (text, label = "연락처") => {
    navigator.clipboard.writeText(text);
    showToast(`${label}가 클립보드에 복사되었습니다.`);
  };

  // CSV 다운로드
  const downloadCSV = () => {
    if (applications.length === 0) return;
    const headers = [
      "신청일시",
      "진행상태",
      "병원룸_공유상태",
      "병원명",
      "고객사",
      "카테고리",
      "이름",
      "연락처",
      "생년월일",
      "블로그",
      "희망시술",
      "1지망",
      "2지망",
      "3지망",
      "확정예약일",
      "시술부위설명",
      "지원동기",
      "관리자메모",
    ];

    const rows = filteredApplications.map((a) => [
      `"${a.submittedAt || ""}"`,
      `"${a.status || ""}"`,
      `"${a.shareStatus || ""}"`,
      `"${a.hospital || ""}"`,
      `"${a.client || ""}"`,
      `"${a.category || ""}"`,
      `"${a.name || ""}"`,
      `"${a.phone || ""}"`,
      `"${a.birthdate || ""}"`,
      `"${a.blogUrl || ""}"`,
      `"${(a.treatment || "").replace(/"/g, '""')}"`,
      `"${(a.schedule1 || "").replace(/"/g, '""')}"`,
      `"${(a.schedule2 || "").replace(/"/g, '""')}"`,
      `"${(a.schedule3 || "").replace(/"/g, '""')}"`,
      `"${a.confirmedDate || ""}"`,
      `"${(a.imageNote || "").replace(/"/g, '""')}"`,
      `"${(a.userNote || "").replace(/"/g, '""')}"`,
      `"${(a.memo || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `체험단_지원자_목록_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV 파일이 다운로드되었습니다.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#202124] text-white px-5 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Google Material App Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E0E3E7] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[#202124]">
                체험단 라운지 Console
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-[#5F6368] hidden sm:block">
              구글 시트 연동 통합 지원자 관리 시스템
            </p>
          </div>
        </div>

        {/* Center: Google Style Global Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="지원자 이름, 연락처(뒷번호), 병원명, 블로그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-[#F1F3F4] hover:bg-[#E8EAED] focus:bg-white border border-transparent focus:border-blue-600 rounded-full text-xs font-medium text-[#202124] placeholder-[#80868B] outline-none transition-all shadow-inner"
            />
            <svg
              className="w-4 h-4 text-[#5F6368] absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5F6368] hover:text-[#202124] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] transition-colors cursor-pointer"
            title="새로고침"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <span className="text-emerald-600 font-bold">▦</span>
              <span>구글 시트 열기</span>
              <svg className="w-3 h-3 text-[#5F6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          <button
            onClick={downloadCSV}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span>CSV 저장</span>
          </button>

          <button
            onClick={() => setShowScriptModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>연동 스크립트</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-[#5F6368] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="로그아웃"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Notice Banner (If Script Needs Update) */}
        {isScriptOutdated && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  구글 앱스 스크립트 최신 버전 업데이트 권장
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  현재 구글 시트에 연결된 스크립트가 지원서 저장 전용 구버전으로 확인됩니다.
                  우측 상단 <strong>[연동 스크립트]</strong> 버튼을 눌러 최신 코드로 새 배포를 하시면,
                  구글 시트에 쌓인 지원자가 1초 만에 대시보드로 실시간 동기화됩니다! (현재는 미리보기용 표준 데이터가 활성화되어 있습니다.)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowScriptModal(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              코드 복사하기
            </button>
          </div>
        )}

        {/* 2. KPI Metric Cards (Google Style Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E3E7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider block">
              전체 지원 건수
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#202124] mt-2">
              {metrics.total}
              <span className="text-xs font-medium text-[#5F6368] ml-1">건</span>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
              ● 실시간 누적 접수
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E3E7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              대기 중 (확정 필요)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-2">
              {metrics.pending}
              <span className="text-xs font-medium text-amber-700 ml-1">건</span>
            </div>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              병원 일정 조율 대상
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E3E7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
              예약 확정
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-800 mt-2">
              {metrics.confirmed}
              <span className="text-xs font-medium text-blue-700 ml-1">건</span>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
              내원 대기 중
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E3E7] shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              방문 완료
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-2">
              {metrics.completed}
              <span className="text-xs font-medium text-emerald-700 ml-1">건</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              원고 발행 대기
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E3E7] shadow-2xs hover:shadow-xs transition-shadow col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              취소 / 보류
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-800 mt-2">
              {metrics.canceled}
              <span className="text-xs font-medium text-rose-700 ml-1">건</span>
            </div>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
              대기자 이월 처리
            </span>
          </div>
        </div>

        {/* 3. Filter Bar (Google Style Segmented Tabs & Chips) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E0E3E7] shadow-2xs space-y-3.5">
          {/* Top Row: Status Tabs */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {["전체", "대기중", "예약확정", "방문완료", "취소"].map((tab) => {
                const count =
                  tab === "전체"
                    ? applications.length
                    : applications.filter((a) => a.status === tab).length;
                const isSelected = selectedStatusTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedStatusTab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#202124] text-white shadow-xs"
                        : "bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8EAED] hover:text-[#202124]"
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isSelected ? "bg-white/20 text-white" : "bg-black/5 text-[#5F6368]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort & Quick Search for Mobile */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="px-3 py-1.5 bg-[#F1F3F4] hover:bg-[#E8EAED] rounded-xl text-xs font-semibold text-[#3C4043] outline-none cursor-pointer border-none"
              >
                {hospitalOptions.map((h) => (
                  <option key={h} value={h}>
                    병원: {h}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="px-3 py-1.5 bg-[#F1F3F4] hover:bg-[#E8EAED] rounded-xl text-xs font-semibold text-[#3C4043] flex items-center gap-1 cursor-pointer"
              >
                <span>{sortOrder === "desc" ? "최신 신청순 ↓" : "과거 신청순 ↑"}</span>
              </button>
            </div>
          </div>

          {/* Search bar for mobile view */}
          <div className="block md:hidden pt-2 border-t border-[#F1F3F4]">
            <input
              type="text"
              placeholder="지원자 이름, 연락처, 병원명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F1F3F4] rounded-xl text-xs font-medium text-[#202124] outline-none"
            />
          </div>
        </div>

        {/* 4. Material Data Table */}
        <div className="bg-white rounded-3xl border border-[#E0E3E7] shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F1F3F4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#202124]">
                지원자 명단
              </h3>
              <span className="text-xs text-[#5F6368]">
                (총 {filteredApplications.length}명)
              </span>
            </div>
            <span className="text-[11px] text-[#80868B]">
              행을 클릭하면 상세 패널이 열립니다.
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-[#5F6368]">구글 시트 지원자 데이터를 불러오는 중...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-24 text-center space-y-2">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-bold text-[#3C4043]">조건에 일치하는 지원자가 없습니다.</p>
              <p className="text-xs text-[#80868B]">검색어를 변경하거나 필터를 초기화해 보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[#5F6368] font-bold border-b border-[#E0E3E7] select-none">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-28">진행 상태</th>
                    <th className="py-3 px-4 w-32">신청일시</th>
                    <th className="py-3 px-4 min-w-[150px]">지원자 정보</th>
                    <th className="py-3 px-4 min-w-[180px]">병원 / 희망시술</th>
                    <th className="py-3 px-4 min-w-[140px]">블로그</th>
                    <th className="py-3 px-4 min-w-[180px]">희망 일정 (1~3지망)</th>
                    <th className="py-3 px-4 w-20 text-center">첨부사진</th>
                    <th className="py-3 px-4 w-36 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F4]">
                  {filteredApplications.map((item, idx) => {
                    const statusObj =
                      STATUS_OPTIONS.find((s) => s.label === item.status) || STATUS_OPTIONS[0];

                    return (
                      <tr
                        key={item.rowId || idx}
                        onClick={() => setActiveItem(item)}
                        className={`hover:bg-[#F8FAFD] transition-colors cursor-pointer group ${
                          activeItem?.rowId === item.rowId ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center text-[#80868B] font-medium">
                          {idx + 1}
                        </td>

                        {/* Status Select & Room Sync Badge */}
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-1">
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateStatus(item, e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border outline-none cursor-pointer ${getStatusStyle(item.status)}`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.label} value={opt.label}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {item.shareStatus && (
                              <div
                                title="병원별 프로젝트 룸 연동 상태"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <span>룸:{item.shareStatus}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-[#5F6368] font-medium whitespace-nowrap">
                          {item.submittedAt ? item.submittedAt.slice(0, 16) : "-"}
                        </td>

                        {/* Applicant */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#202124] flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.ageInfo && (
                              <span className="text-[10px] text-[#5F6368] font-normal">
                                ({item.ageInfo})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#5F6368] mt-0.5">
                            <span>{item.phone}</span>
                            {item.phone !== "-" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(item.phone, "전화번호");
                                }}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                                title="전화번호 복사"
                              >
                                📋
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Hospital & Treatment */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] mr-1.5 mb-1">
                            {item.hospital}
                          </span>
                          <span className="text-[11px] text-[#5F6368] font-medium">
                            {item.category}
                          </span>
                          <p className="text-xs font-semibold text-[#202124] line-clamp-1 mt-0.5">
                            {item.treatment}
                          </p>
                        </td>

                        {/* Blog */}
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.blogUrl ? (
                            <a
                              href={formatBlogUrl(item.blogUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 group/link max-w-[140px] truncate"
                              title={item.blogUrl}
                            >
                              <span className="truncate">{item.blogUrl.replace(/^https?:\/\//, "")}</span>
                              <span className="text-[10px] opacity-70 group-hover/link:opacity-100">↗</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Schedule */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-[#202124] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>1지망: {item.schedule1 || item.schedules[0] || "-"}</span>
                            </div>
                            {item.schedule2 && (
                              <div className="text-[11px] text-[#5F6368]">
                                2지망: {item.schedule2}
                              </div>
                            )}
                            {item.confirmedDate && (
                              <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                확정: {item.confirmedDate}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Photos */}
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.imageUrls && item.imageUrls.length > 0 ? (
                            <button
                              onClick={() => setLightboxImage(item.imageUrls[0])}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              <span>📸</span>
                              <span>{item.imageUrls.length}장</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </td>

                        {/* Action View & Delete */}
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setActiveItem(item)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#3C4043] font-bold text-xs transition-colors cursor-pointer"
                            >
                              보기
                            </button>
                            <button
                              onClick={() => handleOpenMessageModal(item)}
                              className="px-2 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors cursor-pointer"
                              title="메시지/문자 작성"
                            >
                              문자
                            </button>
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                              title="지원서 삭제"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 5. Google Style Detail Side Sheet / Drawer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E0E3E7] flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  {activeItem.name?.slice(0, 1) || "지"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#202124]">
                      {activeItem.name} 님 지원서
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {activeItem.hospital}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5F6368]">
                    접수: {activeItem.submittedAt || "-"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#5F6368] flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Status & Confirmed Date Card */}
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E0E3E7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5F6368]">진행 상태</span>
                  <select
                    value={activeItem.status}
                    onChange={(e) => handleUpdateStatus(activeItem, e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#DADCE0] shadow-2xs outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hospital Project Room Sync Status */}
                  <div className="pt-2.5 border-t border-[#E0E3E7] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#5F6368]">
                      <span>🏥</span>
                      <span className="font-semibold">병원 룸 연동:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        activeItem.shareStatus
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          : "bg-slate-200/80 text-slate-600"
                      }`}>
                        {activeItem.shareStatus || "미연동"}
                      </span>
                      {activeItem.client && (
                        <span className="text-[10px] text-[#5F6368]">({activeItem.client})</span>
                      )}
                    </div>
                  </div>

                  {activeItem.confirmedDate && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold flex items-center justify-between">
                    <span>확정된 예약일시: <strong>{activeItem.confirmedDate}</strong></span>
                    <button
                      onClick={() => handleUpdateStatus(activeItem, activeItem.status, "")}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      초기화
                    </button>
                  </div>
                )}
              </div>

              {/* Applicant Contact Profile */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
                  지원자 인적사항
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-[#E0E3E7] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#80868B] block">연락처</span>
                    <div className="font-bold text-[#202124] flex items-center justify-between">
                      <span>{activeItem.phone}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(activeItem.phone, "전화번호")}
                          className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                        >
                          복사
                        </button>
                        <a
                          href={`tel:${activeItem.rawPhone || activeItem.phone}`}
                          className="text-[11px] text-[#5F6368] hover:text-blue-600 cursor-pointer"
                          title="전화 걸기"
                        >
                          📞
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#E0E3E7] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#80868B] block">생년월일 (나이)</span>
                    <span className="font-bold text-[#202124] block">
                      {activeItem.ageInfo || activeItem.birthdate || "-"}
                    </span>
                  </div>
                </div>

                {activeItem.blogUrl && (
                  <div className="p-3 bg-white border border-[#E0E3E7] rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] text-[#80868B] block">블로그 주소</span>
                    <a
                      href={formatBlogUrl(activeItem.blogUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:underline break-all block"
                    >
                      {activeItem.blogUrl} ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Schedules (1~3 Choices with 1-click confirmation) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
                    희망 예약 일정
                  </h4>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    원클릭 예약 확정 가능
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { priority: "1지망", val: activeItem.schedule1 || activeItem.schedules[0] },
                    { priority: "2지망", val: activeItem.schedule2 || activeItem.schedules[1] },
                    { priority: "3지망", val: activeItem.schedule3 || activeItem.schedules[2] },
                  ]
                    .filter((s) => s.val && s.val.trim() !== "")
                    .map((item, idx) => {
                      const isConfirmed = activeItem.confirmedDate === item.val;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                            isConfirmed
                              ? "bg-blue-50 border-blue-300"
                              : "bg-white border-[#E0E3E7] hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                              {item.priority}
                            </span>
                            <span className="text-xs font-bold text-[#202124]">
                              {item.val}
                            </span>
                          </div>

                          <button
                            onClick={() => handleUpdateStatus(activeItem, "예약확정", item.val)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              isConfirmed
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700"
                            }`}
                          >
                            {isConfirmed ? "✓ 확정됨" : "확정하기"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Photos Gallery */}
              {activeItem.imageUrls && activeItem.imageUrls.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
                    시술 부위 첨부사진 ({activeItem.imageUrls.length}장)
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {activeItem.imageUrls.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setLightboxImage(url)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-[#E0E3E7] bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-shadow"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getDriveThumbnailUrl(url)}
                          alt={`사진 ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            // 구글 드라이브 뷰 페이지일 경우 대체 이미지 배너
                            e.target.onerror = null; e.target.src = "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x128.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          확대보기 🔍
                        </div>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1">
                    {activeItem.imageUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline block truncate"
                      >
                        사진 #{i + 1} 구글 드라이브 원본 링크 ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Condition Note & User Note */}
              <div className="space-y-4">
                {activeItem.imageNote && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#5F6368]">
                      시술부위 상태 상세설명
                    </span>
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E0E3E7] text-xs text-[#202124] leading-relaxed">
                      {activeItem.imageNote}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#5F6368]">
                    지원동기 및 특이사항
                  </span>
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E0E3E7] text-xs text-[#202124] leading-relaxed whitespace-pre-wrap">
                    {activeItem.userNote || "기재된 특이사항 없음"}
                  </div>
                </div>
              </div>

              {/* Admin Memo Editor */}
              <div className="space-y-1.5 pt-2 border-t border-[#E0E3E7]">
                <span className="text-xs font-bold text-[#3C4043] flex items-center justify-between">
                  <span>관리자 메모</span>
                  <span className="text-[10px] text-[#80868B] font-normal">자동 저장</span>
                </span>
                <textarea
                  rows={3}
                  placeholder="병원 전달 특이사항이나 진행 메모를 입력하세요."
                  defaultValue={activeItem.memo || ""}
                  onBlur={(e) => handleUpdateMemo(activeItem, e.target.value)}
                  className="w-full p-3 bg-white border border-[#DADCE0] focus:border-blue-600 rounded-xl text-xs text-[#202124] outline-none"
                />
              </div>

            </div>

            {/* Drawer Bottom Bar */}
            <div className="p-4 border-t border-[#E0E3E7] bg-white flex items-center gap-2">
              <button
                onClick={() => setItemToDelete(activeItem)}
                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                title="지원서 삭제"
              >
                <span>🗑️</span>
                <span>삭제</span>
              </button>
              <button
                onClick={() => handleOpenMessageModal(activeItem)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>💬</span>
                <span>메시지 보내기</span>
              </button>
              <button
                onClick={() => setActiveItem(null)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Full Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-2xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between px-5">
              <span className="text-xs font-bold">첨부사진 확대 뷰어</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/5 overflow-auto max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDriveThumbnailUrl(lightboxImage)}
                alt="확대 사진"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between px-5">
              <a
                href={lightboxImage}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                구글 드라이브에서 열기 ↗
              </a>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Google Apps Script Code Modal */}
      {showScriptModal && (
        <div
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowScriptModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E0E3E7] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-base font-bold text-[#202124]">
                  구글 앱스 스크립트 실시간 연동 코드
                </h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#5F6368] flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs leading-relaxed text-[#3C4043]">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-1.5">
                <h5 className="font-bold text-blue-950">📌 실시간 연동 적용 방법 (1분 소요)</h5>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800">
                  <li>구글 시트 상단 메뉴에서 <strong>[확장 프로그램] ➔ [Apps Script]</strong>를 클릭합니다.</li>
                  <li>기존 코드를 모두 지우고, 아래 복사한 코드를 <strong>전체 붙여넣기</strong>합니다.</li>
                  <li>우측 상단 <strong>[배포] ➔ [새 배포]</strong> 클릭 후 완료하시면 대시보드와 실시간 연동됩니다!</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202124]">최신 Google Apps Script 코드</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SCRIPT_CODE_TEXT);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                      showToast("스크립트 코드가 복사되었습니다!");
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copiedScript ? "✓ 복사 완료!" : "전체 코드 복사"}
                  </button>
                </div>
                <pre className="p-4 bg-[#202124] text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 leading-normal select-all">
                  {SCRIPT_CODE_TEXT}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-[#E0E3E7] bg-white flex justify-end">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Message Sending Modal Dialog (Google M3 Style) */}
      {messageApplicant && (
        <div
          className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setMessageApplicant(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E0E3E7] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E0E3E7] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                  💬
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#202124] flex items-center gap-1.5">
                    <span>메시지 보내기</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {messageApplicant.name} 님
                    </span>
                  </h3>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    수신 번호: <strong className="text-[#202124]">{messageApplicant.phone}</strong> · {messageApplicant.hospital}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMessageApplicant(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#5F6368] flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              
              {/* Template Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5F6368] block">
                  상황별 맞춤 템플릿 선택
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { key: "schedule", label: "📅 일정 조율" },
                    { key: "confirm", label: "✓ 예약 확정" },
                    { key: "review", label: "✍️ 리뷰 안내" },
                    { key: "custom", label: "✏️ 직접 작성" },
                  ].map((tpl) => (
                    <button
                      key={tpl.key}
                      onClick={() => handleSelectTemplate(tpl.key)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                        selectedTemplateKey === tpl.key
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-[#F8F9FA] hover:bg-slate-100 text-[#3C4043] border-[#E0E3E7]"
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Editor Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#202124]">
                    메시지 내용 (문자 / 알림톡)
                  </label>
                  <span className="text-[11px] text-[#80868B]">
                    {customMessageText.length}자
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={customMessageText}
                  onChange={(e) => setCustomMessageText(e.target.value)}
                  placeholder="보내실 메시지 내용을 입력하세요..."
                  className="w-full p-3.5 bg-[#F8F9FA] border border-[#DADCE0] focus:border-blue-600 focus:bg-white rounded-2xl text-xs text-[#202124] leading-relaxed outline-none transition-colors"
                />
              </div>

              {/* Tips */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-[#5F6368] space-y-1">
                <p className="font-semibold text-[#202124]">💡 발송 방법 안내</p>
                <p>• <strong>[메시지 복사]</strong>: 카카오톡 채널 또는 병원 문자 발송 솔루션에 바로 붙여넣기 하실 수 있습니다.</p>
                <p>• <strong>[문자 앱 열기]</strong>: 모바일 기기 또는 Windows 스마트폰 연결 앱에서 즉시 SMS 발송창이 열립니다.</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 px-5 border-t border-[#E0E3E7] bg-white flex items-center justify-between gap-2">
              <a
                href={`tel:${messageApplicant.rawPhone || messageApplicant.phone}`}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                title="음성 전화 연결"
              >
                <span>📞</span>
                <span className="hidden sm:inline">전화 걸기</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(customMessageText);
                    setCopiedMessage(true);
                    setTimeout(() => setCopiedMessage(false), 2000);
                    showToast("메시지가 클립보드에 복사되었습니다!");
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    copiedMessage
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white hover:bg-slate-100 text-[#3C4043] border-[#DADCE0]"
                  }`}
                >
                  <span>{copiedMessage ? "✓" : "📋"}</span>
                  <span>{copiedMessage ? "복사 완료!" : "메시지 복사"}</span>
                </button>

                <a
                  href={`sms:${(messageApplicant.rawPhone || messageApplicant.phone).replace(/[^0-9]/g, "")}?body=${encodeURIComponent(customMessageText)}`}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>💬</span>
                  <span>문자 앱 열기</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Deletion Confirmation Modal Dialog (Google M3 Alert Dialog) */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setItemToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="p-6 pb-4 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#202124]">
                  지원서 삭제 확인
                </h3>
                <p className="text-xs text-[#5F6368]">
                  선택하신 지원자 데이터를 영구 삭제합니다.
                </p>
              </div>
            </div>

            {/* Target Applicant Info Card */}
            <div className="px-6 py-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6368]">지원자</span>
                  <span className="font-bold text-[#202124]">
                    {itemToDelete.name || "미지정"} ({itemToDelete.phone || "-"})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6368]">병원 / 희망시술</span>
                  <span className="font-semibold text-[#202124] max-w-[220px] truncate">
                    {itemToDelete.hospital} / {itemToDelete.treatment}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6368]">접수일시</span>
                  <span className="text-[#5F6368]">
                    {itemToDelete.submittedAt || "-"}
                  </span>
                </div>
                {itemToDelete.shareStatus && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-[#5F6368]">병원 룸 연동상태</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[10px]">
                      {itemToDelete.shareStatus}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
                <p className="font-semibold">⚠️ 주의: 삭제 시 되돌릴 수 없습니다.</p>
                <p className="mt-0.5 text-rose-700">
                  구글 스프레드시트(DB 탭)에서도 해당 행이 완전히 삭제되며 복구할 수 없습니다. 계속 진행하시겠습니까?
                </p>
                {itemToDelete.shareStatus && (
                  <p className="mt-1.5 font-semibold text-rose-900 bg-rose-100/80 p-1.5 rounded text-[10px]">
                    ※ 현재 병원 프로젝트 룸과 연동({itemToDelete.shareStatus}) 중인 데이터입니다.
                  </p>
                )}
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="p-4 px-6 mt-3 bg-[#F8F9FA] border-t border-[#E0E3E7] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-[#DADCE0] text-xs font-bold text-[#3C4043] transition-colors cursor-pointer disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>삭제하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const SCRIPT_CODE_TEXT = "// ==========================================\n// 체험단 라운지 통합 웹훅 & 관리자 대시보드 연동 스크립트 (통합 버전)\n// ==========================================\n// 기존 기능(캠페인 목록 조회, 고객사별 드라이브 사진 보관, 접수DB 저장, 알림메일 발송) 100% 유지\n// + 신규 기능(관리자 대시보드 실시간 지원자 목록 조회 및 예약확정/상태/메모 동기화)이 안전하게 통합되었습니다.\n\n// 1. GET 요청 처리 (사이트 캠페인 동기화 & 관리자 대시보드 데이터 조회)\nfunction doGet(e) {\n  var action = e && e.parameter && e.parameter.action;\n\n  // [기존 기능] 사이트가 ?action=campaigns 로 부르면 '사이트관리' 탭의 모집 목록을 JSON으로 반환\n  if (action === \"campaigns\") {\n    return ContentService\n      .createTextOutput(JSON.stringify(readCampaigns_()))\n      .setMimeType(ContentService.MimeType.JSON);\n  }\n\n  // [신규 기능] 관리자 대시보드가 ?action=applications 로 부르면 'DB' 탭의 지원자 목록을 JSON으로 반환\n  if (action === \"applications\" || action === \"getAll\") {\n    return ContentService\n      .createTextOutput(JSON.stringify(readApplications_()))\n      .setMimeType(ContentService.MimeType.JSON);\n  }\n\n  // 기본 상태 확인 응답\n  return ContentService\n    .createTextOutput(JSON.stringify({ result: \"success\", message: \"체험단 지원서 Webhook 정상 동작 중\" }))\n    .setMimeType(ContentService.MimeType.JSON);\n}\n\n// '사이트관리' 탭에서 캠페인 목록 읽기 (기존 함수 원본 유지)\nfunction readCampaigns_() {\n  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(\"사이트관리\");\n  if (!sh || sh.getLastRow() < 2) return [];\n  var vals = sh.getDataRange().getValues();\n  var h = vals[0].map(function (x) { return String(x).trim(); });\n  var col = function (r, n) { var j = h.indexOf(n); return j < 0 ? \"\" : String(r[j]).trim(); };\n  var lines = function (t) { return t ? t.split(\"\\n\").map(function (x) { return x.trim(); }).filter(Boolean) : []; };\n  var out = [];\n  for (var i = 1; i < vals.length; i++) {\n    var r = vals[i];\n    var status = col(r, \"상태\");\n    if (!col(r, \"ID\") || status === \"숨김\") continue; // 상태가 '숨김'이면 사이트에 내보내지 않음\n    out.push({\n      id: col(r, \"ID\"),\n      status: status || \"모집중\",\n      hospital: col(r, \"병원\"),\n      category: col(r, \"카테고리\"),\n      title: col(r, \"캠페인명\"),\n      location: col(r, \"지역\") || \"서울 강남\",\n      channel: col(r, \"채널\") || \"블로그\",\n      offer: col(r, \"제공혜택\"),\n      copay: col(r, \"본인부담\"),\n      visits: col(r, \"방문횟수\") || \"1회 방문\",\n      description: col(r, \"제공혜택\"),\n      benefits: lines(col(r, \"혜택상세\")),\n      missions: lines(col(r, \"리뷰미션\")),\n      conditions: lines(col(r, \"신청조건\")),\n      notices: lines(col(r, \"필수유의사항\")),\n      schedule: {\n        announcement: col(r, \"발표일정\") || \"신청서 검토 후 순차 개별 연락드립니다.\",\n        activity: col(r, \"활동일정\") || \"선정 직후 예약 일정 조율 후 내원 진행합니다.\"\n      }\n    });\n  }\n  return out;\n}\n\n// [신규 기능] 'DB' 탭에서 지원자 전체 목록을 구조화하여 관리자 대시보드로 전달\nfunction readApplications_() {\n  try {\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\n    var sh = ss.getSheetByName(\"DB\") || ss.getSheetByName(\"접수DB\");\n    if (!sh || sh.getLastRow() < 2) {\n      return { result: \"success\", rows: [] };\n    }\n\n    var vals = sh.getDataRange().getValues();\n    var h = vals[0].map(function (x) { return String(x).trim(); });\n    var col = function (r, n) {\n      var j = h.indexOf(n);\n      return j < 0 ? \"\" : (r[j] !== undefined && r[j] !== null ? String(r[j]).trim() : \"\");\n    };\n\n    var rows = [];\n    for (var i = 1; i < vals.length; i++) {\n      var r = vals[i];\n      var submittedAt = col(r, \"신청일시\") || col(r, \"일시\") || col(r, \"접수일시\");\n      var name = col(r, \"이름\") || col(r, \"지원자\") || col(r, \"지원자명\");\n      var phone = col(r, \"연락처\") || col(r, \"전화번호\") || col(r, \"휴대폰\");\n\n      // 빈 행 건너뛰기\n      if (!submittedAt && !name && !phone) continue;\n\n      var imgRaw = col(r, \"첨부사진링크\") || col(r, \"첨부사진\") || col(r, \"사진링크\") || col(r, \"사진\");\n      var images = imgRaw ? imgRaw.split(\"\\n\").map(function(s){ return s.trim(); }).filter(Boolean) : [];\n\n      rows.push({\n        rowId: i + 1,\n        submittedAt: submittedAt,\n        campaignId: col(r, \"캠페인ID\"),\n        hospital: col(r, \"클리닉\") || col(r, \"병원\") || col(r, \"병원명\"),\n        treatment: col(r, \"희망시술\") || col(r, \"캠페인명\"),\n        category: col(r, \"카테고리\"),\n        name: name,\n        birthdate: col(r, \"생년월일\"),\n        phone: phone,\n        blogUrl: col(r, \"블로그주소\") || col(r, \"블로그\"),\n        schedule1: col(r, \"1지망\") || col(r, \"1지망일정\"),\n        schedule2: col(r, \"2지망\") || col(r, \"2지망일정\"),\n        schedule3: col(r, \"3지망\") || col(r, \"3지망일정\"),\n        images: images,\n        imageNote: col(r, \"시술부위 상세설명\") || col(r, \"부위설명/특이사항\") || col(r, \"부위설명\"),\n        userNote: col(r, \"지원동기\") || col(r, \"특이사항\") || col(r, \"지원동기/체험소감\") || col(r, \"체험소감\"),\n        status: col(r, \"진행상태\") || \"대기중\",\n        confirmedDate: col(r, \"예약일\"),\n        postDate: col(r, \"원고 발행일\"),\n        keyword: col(r, \"키워드\"),\n        postUrl: col(r, \"발행원고 URL\"),\n        memo: col(r, \"이슈\") || col(r, \"관리자메모\") || \"\",\n        client: col(r, \"고객사\"),\n        shareStatus: col(r, \"공유상태\"),\n        checkStatus: col(r, \"점검\"),\n        syncKey: col(r, \"키\"),\n        roomSyncVal: col(r, \"룸동기값\")\n      });\n    }\n\n    return { result: \"success\", rows: rows };\n  } catch (err) {\n    return { result: \"error\", message: err.toString(), rows: [] };\n  }\n}\n\n// 체험단 지원서 사진은 고객사별 '02_지원서사진' 폴더에 쌓는다. (고객사 이름 = 병원정보 탭의 '고객사')\nvar PHOTO_FOLDERS = {\n  \"살만\": \"1j7Jlt2LWPkFzbg2wyEvfaxFgGf7sYgSo\",\n  \"큐어람\": \"1VQihiH2xh_UjIcg5kvT0oOxEbM2VQ9VG\"\n};\nvar PHOTO_FOLDER_DEFAULT = \"살만\"; // 고객사를 못 찾았을 때 쓰는 폴더\n\n// 병원 이름 → 고객사 이름 ('병원정보' 탭의 '시트의 표기' → '고객사'). 접수 알림 메일 제목에 쓴다.\nfunction clientOf_(hospital) {\n  var h = String(hospital || \"\").replace(/\\s+/g, \"\");\n  if (!h) return \"고객사 미확인\";\n  try {\n    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(\"병원정보\");\n    if (!sh) return \"고객사 미확인\";\n    var rows = sh.getDataRange().getValues().slice(1);\n    for (var i = 0; i < rows.length; i++) { // 정확히 같은 표기\n      if (String(rows[i][0]).replace(/\\s+/g, \"\") === h && rows[i][4]) return String(rows[i][4]).trim();\n    }\n    for (var j = 0; j < rows.length; j++) { // 한쪽이 다른 쪽을 포함 (예: '큐어람' / '큐어람한의원')\n      var k = String(rows[j][0]).replace(/\\s+/g, \"\");\n      if (k && rows[j][4] && (h.indexOf(k) >= 0 || k.indexOf(h) >= 0)) return String(rows[j][4]).trim();\n    }\n  } catch (err) {\n    Logger.log(\"client lookup err: \" + err.toString());\n  }\n  return \"고객사 미확인\";\n}\n\n// 고객사에 맞는 사진 폴더를 돌려준다. 목록에 없으면 기본 폴더(살만).\nfunction getOrCreateFolder(client) {\n  var id = PHOTO_FOLDERS[client] || PHOTO_FOLDERS[PHOTO_FOLDER_DEFAULT];\n  if (!PHOTO_FOLDERS[client]) Logger.log(\"사진 폴더: '\" + client + \"' 미등록 → 기본 폴더 사용\");\n  return DriveApp.getFolderById(id);\n}\n\n// 2. POST 요청 처리 (지원서 접수 & 관리자 상태 업데이트)\nfunction doPost(e) {\n  try {\n    var contents = e.postData.contents;\n    var data = JSON.parse(contents);\n\n    // [신규 기능] 관리자 대시보드에서 보낸 상태/예약일/메모 업데이트 요청 처리\n    if (data && data.action === \"updateStatus\") {\n      return handleUpdateStatus_(data);\n    }\n\n    // [신규 기능] 관리자 대시보드에서 보낸 지원서 행 삭제 요청 처리\n    if (data && data.action === \"deleteRow\") {\n      return handleDeleteRow_(data);\n    }\n\n    // --- 이하 기존 신규 지원서 접수 처리 로직 (100% 원본 유지) ---\n    // 1. 현재 시트에서 \"DB\" 탭 가져오기 (예전 이름 \"접수DB\"도 인식, 없으면 자동 생성)\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\n    var sheet = ss.getSheetByName(\"DB\") || ss.getSheetByName(\"접수DB\");\n    if (!sheet) {\n      sheet = ss.insertSheet(\"DB\");\n    }\n\n    var now = new Date();\n    var dateString = Utilities.formatDate(now, \"Asia/Seoul\", \"yyyy-MM-dd HH:mm:ss\");\n\n    // 2. 첨부 사진을 구글 드라이브에 저장하고 링크 추출\n    var finalImageUrls = [];\n    var rawImages = data.rawImages || data.images || [];\n    var folder = null;\n    try {\n      folder = getOrCreateFolder(clientOf_(data.hospital));\n    } catch (fErr) {\n      Logger.log(\"Folder access err: \" + fErr.toString());\n    }\n\n    var driveNameBase = data.driveFileName || (data.name + \"_\" + (data.campaignId || \"캠페인\"));\n\n    for (var i = 0; i < rawImages.length; i++) {\n      var driveUrl = \"\";\n      var fileName = driveNameBase + \"_사진\" + (i + 1) + \".jpg\";\n\n      if (folder && rawImages[i] && typeof rawImages[i] === \"string\" && rawImages[i].indexOf(\"data:image\") === 0) {\n        try {\n          var parts = rawImages[i].split(\",\");\n          var contentType = (parts[0].match(/:(.*?);/) || [])[1] || \"image/jpeg\";\n          var base64 = parts[1];\n          var blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, fileName);\n          var file = folder.createFile(blob);\n          driveUrl = file.getUrl();\n        } catch (e1) {\n          Logger.log(\"Drive save err: \" + e1.toString());\n        }\n      }\n\n      if (driveUrl) {\n        finalImageUrls.push(driveUrl);\n      }\n    }\n\n    var imagesString = finalImageUrls.join(\"\\n\");\n\n    // 3. 컬럼 헤더 자동 인식 및 데이터 매핑\n    var headers = [];\n    if (sheet.getLastRow() > 0) {\n      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];\n    }\n\n    // 만약 시트가 완전히 비어있다면 기본 헤더 자동 생성\n    if (headers.length === 0 || !headers[0]) {\n      headers = [\n        \"신청일시\", \"캠페인ID\", \"클리닉\", \"희망시술\", \"카테고리\",\n        \"이름\", \"생년월일\", \"연락처\", \"블로그주소\",\n        \"블로그지수\", \"1지망\", \"2지망\", \"3지망\",\n        \"개인정보동의\", \"6개월유지동의\", \"미션수행동의\", \"마케팅동의\", \"일정변경불가동의\",\n        \"첨부사진링크\", \"시술부위 상세설명\", \"지원동기\",\n        \"공유상태\", \"점검\", \"고객사\", \"모집정보(원문)\", \"키\",\n        \"진행상태\", \"예약일\", \"원고 발행일\", \"키워드\", \"발행원고 URL\", \"성과\", \"이슈\", \"룸동기값\"\n      ];\n      sheet.appendRow(headers);\n    }\n\n    // 각 헤더명에 대응하는 데이터 매핑 사전\n    var fieldMap = {\n      \"신청일시\": dateString,\n      \"일시\": dateString,\n      \"접수일시\": dateString,\n      \"캠페인ID\": data.campaignId || \"\",\n      \"캠페인명\": data.campaignTitle || \"\",\n      \"병원\": data.hospital || \"\",\n      \"병원명\": data.hospital || \"\",\n      \"클리닉\": data.hospital || \"\",\n      \"희망시술\": data.campaignTitle || \"\",\n      \"카테고리\": data.category || \"\",\n      \"이름\": data.name || \"\",\n      \"지원자\": data.name || \"\",\n      \"지원자명\": data.name || \"\",\n      \"생년월일\": data.birthdate || \"\",\n      \"연락처\": data.phone || \"\",\n      \"전화번호\": data.phone || \"\",\n      \"휴대폰\": data.phone || \"\",\n      \"블로그\": data.blogUrl || \"\",\n      \"블로그주소\": data.blogUrl || \"\",\n      \"1지망일정\": data.schedule1 || \"\",\n      \"1지망\": data.schedule1 || \"\",\n      \"2지망일정\": data.schedule2 || \"\",\n      \"2지망\": data.schedule2 || \"\",\n      \"3지망일정\": data.schedule3 || \"\",\n      \"3지망\": data.schedule3 || \"\",\n      \"개인정보동의\": data.agreePrivacy ? \"동의\" : \"미동의\",\n      \"6개월유지동의\": data.agreeRetention ? \"동의\" : \"미동의\",\n      \"유지동의\": data.agreeRetention ? \"동의\" : \"미동의\",\n      \"미션수행동의\": data.agreeMission ? \"동의\" : \"미동의\",\n      \"미션동의\": data.agreeMission ? \"동의\" : \"미동의\",\n      \"마케팅동의\": data.agreeMarketing ? \"동의\" : \"미동의\",\n      \"일정변경불가동의\": data.agreeNoChange ? \"동의\" : \"미동의\",\n      \"일정변경동의\": data.agreeNoChange ? \"동의\" : \"미동의\",\n      \"첨부사진링크\": imagesString,\n      \"첨부사진\": imagesString,\n      \"사진\": imagesString,\n      \"사진링크\": imagesString,\n      \"부위설명/특이사항\": data.imageNote || \"\",\n      \"부위설명\": data.imageNote || \"\",\n      \"시술부위 상세설명\": data.imageNote || \"\",\n      \"특이사항\": data.userNote || \"\",\n      \"지원동기\": data.userNote || \"\",\n      \"지원동기/체험소감\": data.userNote || \"\",\n      \"체험소감\": data.userNote || \"\",\n      \"진행상태\": \"대기중\"\n    };\n\n    var rowData = [];\n    for (var k = 0; k < headers.length; k++) {\n      var colHeader = String(headers[k]).trim();\n      rowData.push(fieldMap[colHeader] !== undefined ? fieldMap[colHeader] : \"\");\n    }\n    sheet.appendRow(rowData);\n\n    // 연락처·생년월일은 문자로 다시 써서 앞자리 0이 사라지지 않게 한다\n    var newRow = sheet.getLastRow();\n    for (var c = 0; c < headers.length; c++) {\n      var hn = String(headers[c]).trim();\n      if (hn === \"연락처\" || hn === \"전화번호\" || hn === \"휴대폰\" || hn === \"생년월일\" || hn === \"신청일시\") {\n        var cell = sheet.getRange(newRow, c + 1);\n        cell.setNumberFormat(\"@\");\n        cell.setValue(String(rowData[c]));\n      }\n    }\n\n    // 4. 관리자 알림 이메일 발송\n    var emailRecipients = [\"gkt0108@gmail.com\", \"team.archivehey@gmail.com\"];\n    var emailSubject = \"[🍊체험단 지원자] \" + clientOf_(data.hospital) + \" / \" + (data.hospital || \"병원 미확인\") + \" 지원자 등장 📩\";\n\n    var emailBodyHtml = \"<h3>체험단 지원서 접수 알림</h3>\" +\n      \"<p><b>신청일시 :</b> \" + dateString + \"</p>\" +\n      \"<p><b>병원명 :</b> \" + (data.hospital || \"-\") + \"</p>\" +\n      \"<p><b>캠페인명 :</b> \" + (data.campaignTitle || \"-\") + \"</p>\" +\n      \"<p><b>이름 :</b> \" + (data.name || \"\") + \"</p>\" +\n      \"<p><b>연락처 :</b> \" + (data.phone || \"\") + \"</p>\" +\n      \"<p><b>생년월일 :</b> \" + (data.birthdate || \"-\") + \"</p>\" +\n      \"<p><b>블로그주소 :</b> <a href='\" + (data.blogUrl || \"\") + \"'>\" + (data.blogUrl || \"\") + \"</a></p>\" +\n      \"<p><b>1지망 일정 :</b> \" + (data.schedule1 || \"\") + \"</p>\" +\n      \"<p><b>2지망 일정 :</b> \" + (data.schedule2 || \"\") + \"</p>\" +\n      \"<p><b>3지망 일정 :</b> \" + (data.schedule3 || \"\") + \"</p>\" +\n      \"<p><b>첨부사진 (구글 드라이브 링크) :</b><br>\" + (imagesString ? imagesString.split(\"\\n\").map(function(url){ return \"<a href='\" + url + \"' target='_blank'>\" + url + \"</a>\"; }).join(\"<br>\") : \"없음\") + \"</p>\" +\n      \"<p><b>시술부위 상세설명 :</b> \" + (data.imageNote || \"-\") + \"</p>\" +\n      \"<p><b>지원동기 :</b> \" + (data.userNote || \"-\") + \"</p>\";\n\n    for (var j = 0; j < emailRecipients.length; j++) {\n      try {\n        MailApp.sendEmail({\n          to: emailRecipients[j],\n          subject: emailSubject,\n          htmlBody: emailBodyHtml\n        });\n      } catch (e) {\n        Logger.log(\"Email send error: \" + e.toString());\n      }\n    }\n\n    return ContentService\n      .createTextOutput(JSON.stringify({ result: \"success\", message: \"구글 시트 저장 및 드라이브 보관 완료\" }))\n      .setMimeType(ContentService.MimeType.JSON);\n\n  } catch (error) {\n    return ContentService\n      .createTextOutput(JSON.stringify({ result: \"error\", message: error.toString() }))\n      .setMimeType(ContentService.MimeType.JSON);\n  }\n}\n\n// [신규 기능] 관리자 상태/예약일/이슈(메모) 업데이트 처리\nfunction handleUpdateStatus_(data) {\n  try {\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\n    var sh = ss.getSheetByName(\"DB\") || ss.getSheetByName(\"접수DB\");\n    if (!sh) {\n      return ContentService\n        .createTextOutput(JSON.stringify({ result: \"error\", message: \"DB 탭을 찾을 수 없습니다.\" }))\n        .setMimeType(ContentService.MimeType.JSON);\n    }\n\n    var targetRow = parseInt(data.rowId, 10);\n    if (!targetRow || targetRow < 2 || targetRow > sh.getLastRow()) {\n      return ContentService\n        .createTextOutput(JSON.stringify({ result: \"error\", message: \"유효하지 않은 행 번호입니다.\" }))\n        .setMimeType(ContentService.MimeType.JSON);\n    }\n\n    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (x) { return String(x).trim(); });\n\n    var setVal = function(colName, value) {\n      var idx = headers.indexOf(colName);\n      if (idx >= 0 && value !== undefined) {\n        sh.getRange(targetRow, idx + 1).setValue(String(value));\n      }\n    };\n\n    if (data.status !== undefined) setVal(\"진행상태\", data.status);\n    if (data.confirmedDate !== undefined) setVal(\"예약일\", data.confirmedDate);\n    if (data.shareStatus !== undefined) setVal(\"공유상태\", data.shareStatus);\n    if (data.memo !== undefined) {\n      if (headers.indexOf(\"이슈\") >= 0) setVal(\"이슈\", data.memo);\n      else if (headers.indexOf(\"관리자메모\") >= 0) setVal(\"관리자메모\", data.memo);\n    }\n\n    return ContentService\n      .createTextOutput(JSON.stringify({ result: \"success\", message: \"상태 업데이트 완료\" }))\n      .setMimeType(ContentService.MimeType.JSON);\n  } catch (err) {\n    return ContentService\n      .createTextOutput(JSON.stringify({ result: \"error\", message: err.toString() }))\n      .setMimeType(ContentService.MimeType.JSON);\n  }\n}\n\n// [신규 기능] 관리자 지원서 행 삭제 처리\nfunction handleDeleteRow_(data) {\n  try {\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\n    var sh = ss.getSheetByName(\"DB\") || ss.getSheetByName(\"접수DB\");\n    if (!sh) {\n      return ContentService\n        .createTextOutput(JSON.stringify({ result: \"error\", message: \"DB 탭을 찾을 수 없습니다.\" }))\n        .setMimeType(ContentService.MimeType.JSON);\n    }\n\n    var targetRow = parseInt(data.rowId, 10);\n    if (!targetRow || targetRow < 2 || targetRow > sh.getLastRow()) {\n      return ContentService\n        .createTextOutput(JSON.stringify({ result: \"error\", message: \"유효하지 않은 행 번호입니다.\" }))\n        .setMimeType(ContentService.MimeType.JSON);\n    }\n\n    sh.deleteRow(targetRow);\n\n    return ContentService\n      .createTextOutput(JSON.stringify({ result: \"success\", message: targetRow + \"행 지원서 삭제 완료\" }))\n      .setMimeType(ContentService.MimeType.JSON);\n  } catch (err) {\n    return ContentService\n      .createTextOutput(JSON.stringify({ result: \"error\", message: err.toString() }))\n      .setMimeType(ContentService.MimeType.JSON);\n  }\n}\n\n// 📌 권한 승인 및 드라이브 폴더 생성 확인용 함수 (기존 원본 유지)\nfunction authorizeEverything() {\n  Object.keys(PHOTO_FOLDERS).forEach(function (c) {\n    Logger.log(\"📁 1. \" + c + \" 사진 폴더 연결 성공: \" + getOrCreateFolder(c).getName());\n  });\n  var ss = SpreadsheetApp.getActiveSpreadsheet();\n  var sheet = ss.getSheetByName(\"DB\") || ss.getSheetByName(\"접수DB\") || ss.insertSheet(\"DB\");\n  Logger.log(\"📊 2. 시트 'DB' 탭 연결 성공: \" + sheet.getName());\n}\n";
