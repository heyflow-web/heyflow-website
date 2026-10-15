"use client";

import { useState, useEffect, useMemo } from "react";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import { formatBlogUrl, getDriveThumbnailUrl, getDrivePreviewUrl, getDriveFileId } from "@/lib/parser";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Field, { Input, Select, SelectChevron, Textarea } from "@/components/ui/Field";
import { statusTone } from "@/components/ui/StatusPill";

const isShared = (item) => {
  if (!item || !item.shareStatus) return false;
  const s = String(item.shareStatus).trim().toLowerCase();
  return s === "공유됨";
};

const STATUS_OPTIONS = [
  { label: "1.신규지원" },
  { label: "2.예약중" },
  { label: "3.체험대기중" },
  { label: "4.포스팅 작성중" },
  { label: "5.원고 검수중" },
  { label: "6.발행완료" },
  { label: "7.드랍" },
];

const extractYearMonth = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const clean = dateStr.trim();
  const matchFull = clean.match(/(\d{4})[-./년\s]+(\d{1,2})/);
  if (matchFull) {
    return `${matchFull[1]}-${matchFull[2].padStart(2, "0")}`;
  }
  const matchMonthOnly = clean.match(/^(\d{1,2})[-./월]/);
  if (matchMonthOnly) {
    return `2026-${matchMonthOnly[1].padStart(2, "0")}`;
  }
  return null;
};

// "2026-10-14 14:00 (오후)" 와 "2026-10-14 14:00" 처럼 표기가 달라도 같은 일정인지 비교하기 위한 값
const slotKey = (v) => {
  const s = String(v || "");
  const d = s.match(/(\d{4})[-./]\s*(\d{1,2})[-./]\s*(\d{1,2})/);
  if (!d) return "";
  let hh = "";
  let mi = "";
  const t = s.match(/(\d{1,2}):(\d{2})/);
  if (t) {
    hh = t[1];
    mi = t[2];
  } else {
    const k = s.match(/(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
    if (k) {
      hh = String((Number(k[2]) % 12) + (k[1] === "오후" ? 12 : 0));
      mi = k[3] || "0";
    }
  }
  const p2 = (x) => String(x).padStart(2, "0");
  return `${d[1]}-${p2(d[2])}-${p2(d[3])} ${hh ? p2(hh) : ""}:${mi ? p2(mi) : ""}`;
};

const currentYearMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getClientName = (app) => {
  if (!app) return "고객사 미지정";
  if (app.client && app.client.trim()) return app.client.trim();
  const h = app.hospital || "";
  if (h.includes("살만")) return "살만";
  if (h.includes("큐어람")) return "큐어람";
  if (h.includes("오블리브")) return "오블리브";
  if (h.includes("온리프")) return "온리프";
  if (h.includes("르샤인")) return "르샤인";
  return h ? h.split(" ")[0].slice(0, 4) : "고객사 미지정";
};

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
  const [sheetUrl, setSheetUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("전체");
  const [selectedHospital, setSelectedHospital] = useState("전체");
  const [selectedClientFilter, setSelectedClientFilter] = useState("전체");
  const [selectedPostMonthFilter, setSelectedPostMonthFilter] = useState("전체");
  const [selectedBillingMonth, setSelectedBillingMonth] = useState(currentYearMonth()); // 월별 발행 집계 대시보드 기준월 (원고 발행일 기준)
  const [isBillingOpen, setIsBillingOpen] = useState(false); // 월별 발행 집계 펼침
  const [onlySharedFilter, setOnlySharedFilter] = useState(false); // 체크박스 필터: 룸 공유완료만 보기
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' | 'asc'
  const [activeItem, setActiveItem] = useState(null); // Side Sheet Drawer
  const [drawerTab, setDrawerTab] = useState("recruit"); // 'recruit' | 'campaign'
  const [lightboxImage, setLightboxImage] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null); // 점검/경고 알림창 { title, lines[] }
  const [itemToDelete, setItemToDelete] = useState(null); // 삭제 확인 모달 대상 지원서
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 진행 중 상태
  const [messageApplicant, setMessageApplicant] = useState(null); // 메시지 전송 대상 지원서
  const [renderedMessages, setRenderedMessages] = useState([]); // 이 지원자에게 보낼 수 있는 모든 단계 문자 [{tpl,text,warn,current}]
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
  const [customMessageText, setCustomMessageText] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [editingField, setEditingField] = useState(null); // 연락처/블로그 주소 인라인 수정: "phone" | "blogUrl"
  const [editValue, setEditValue] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 1. 데이터 가져오기
  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch("/api/admin/applications", { cache: "no-store" });
      if (res.status === 401) {
        window.location.reload(); // 로그인이 풀렸으면 로그인 화면으로
        return;
      }
      const data = await res.json();

      if (data.success) {
        setApplications(data.applications || []);
        setLoadError("");
        if (data.sheetUrl) setSheetUrl(data.sheetUrl);
        if (isManual) showToast("구글 시트 최신 데이터를 불러왔습니다.");
      } else {
        setLoadError(data.error || "구글 시트에서 데이터를 받지 못했어요.");
      }
    } catch (err) {
      console.error(err);
      setLoadError("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setEditingField(null);
  }, [activeItem && activeItem.rowId]);

  // 상세 패널은 Esc로 닫는다 (위에 다른 창이 떠 있으면 그 창이 먼저 닫힌다)
  useEffect(() => {
    if (!activeItem || messageApplicant || itemToDelete || alertInfo || lightboxImage) return;
    const onKey = (e) => {
      if (e.key === "Escape") setActiveItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem, messageApplicant, itemToDelete, alertInfo, lightboxImage]);

  // 2. 시트 저장 공통 처리 ---------------------------------------------
  // 시트 행은 '행 번호 + 키'로 확인한다. 화면에서 바꾼 칸만 보내고, 실패하면 되돌린다.
  const identityOf = (item) => ({
    rowId: item.rowId,
    key: item.syncKey || "",
    name: item.sheetName || item.name || "",
    submittedAt: item.submittedAt || "",
  });

  const patchApp = (rowId, patch) => {
    setApplications((prev) => prev.map((app) => (app.rowId === rowId ? { ...app, ...patch } : app)));
    setActiveItem((prev) => (prev && prev.rowId === rowId ? { ...prev, ...patch } : prev));
  };

  const callAdmin = async (body) => {
    const res = await fetch("/api/admin/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      window.location.reload();
      throw new Error("로그인이 만료되었습니다.");
    }
    return res.json();
  };

  const saveChanges = async (item, changes, okMessage) => {
    const before = {};
    Object.keys(changes).forEach((k) => {
      before[k] = item[k];
    });
    patchApp(item.rowId, changes);
    try {
      const data = await callAdmin({ action: "updateFields", id: identityOf(item), changes });
      if (!data.success) {
        patchApp(item.rowId, before);
        setAlertInfo({ title: "저장하지 못했어요", lines: [data.error || "구글 시트 저장에 실패했습니다."] });
        return false;
      }
      if (data.data && data.data.row) patchApp(item.rowId, data.data.row);
      const warnings = (data.data && data.data.warnings) || [];
      if (warnings.length) setAlertInfo({ title: "저장했어요. 확인해 주세요", lines: warnings });
      else showToast(okMessage);
      return true;
    } catch (err) {
      console.error(err);
      patchApp(item.rowId, before);
      showToast("저장 중 오류가 발생했습니다. 시트 상태를 다시 불러옵니다.");
      fetchData(true);
      return false;
    }
  };

  const handleUpdateStatus = (item, newStatus, confirmedDate = null) => {
    const changes = { status: newStatus };
    if (confirmedDate !== null) changes.confirmedDate = confirmedDate;
    return saveChanges(item, changes, `[${item.name}님] 상태가 '${newStatus}'(으)로 변경되었습니다.`);
  };

  const handleUpdateMemo = (item, newMemo) => {
    if ((item.memo || "") === newMemo) return;
    return saveChanges(item, { memo: newMemo }, "이슈 메모가 저장되었습니다.");
  };

  // 병원 룸 공유 체크박스: 조건이 부족하면 알림창으로 알려주고 체크하지 않는다
  const handleUpdateShareStatus = async (item, isChecked) => {
    try {
      const data = await callAdmin({ action: "setShare", id: identityOf(item), shared: isChecked });
      if (!data.success) {
        setAlertInfo({
          title: data.error || "공유할 수 없어요",
          lines: data.issues && data.issues.length ? data.issues : [],
        });
        return;
      }
      patchApp(item.rowId, { shareStatus: (data.data && data.data.shareStatus) || "" });
      const warnings = (data.data && data.data.warnings) || [];
      if (warnings.length) setAlertInfo({ title: data.message || "확인해 주세요", lines: warnings });
      else showToast(`[${item.name}님] ${data.message}`);
    } catch (err) {
      console.error(err);
      showToast("공유상태 저장 중 오류가 발생했습니다.");
    }
  };

  // 캠페인 현황(블로그지수, 발행일, 발행URL, 성과) — 바뀐 칸만 저장
  const handleUpdateCampaignField = (item, fieldName, value) => {
    const next = String(value).trim();
    if ((item[fieldName] || "") === next) return;
    return saveChanges(item, { [fieldName]: next }, "구글 시트에 저장되었습니다.");
  };

  // 연락처 / 블로그 주소 수정 (시트 DB와 프로젝트룸 모집정보에 같이 반영)
  const startEditContact = (field, current) => {
    setEditingField(field);
    setEditValue(current || "");
  };
  const handleSaveContact = async () => {
    if (!activeItem || !editingField) return;
    const field = editingField;
    const next = editValue.trim();
    const current = field === "phone" ? activeItem.sheetPhone : activeItem.sheetBlog;
    const same = field === "phone" ? digitsOf(next) === digitsOf(current) : next === (current || "");
    if (same) {
      setEditingField(null);
      return;
    }
    const ok = await saveChanges(activeItem, { [field]: next }, "저장되었습니다.");
    if (ok) {
      setEditingField(null);
      await fetchData(true);
    }
  };

  // 3. 지원서 완전 삭제 (키로 같은 사람인지 확인한 뒤 삭제)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setIsDeleting(true);
    try {
      const data = await callAdmin({ action: "deleteRow", id: identityOf(target) });
      if (data.success) {
        // 삭제하면 아래 행 번호가 한 칸씩 당겨지므로 목록을 다시 받는다
        setActiveItem(null);
        await fetchData(true);
        showToast(`[${target.name || "지원자"}님] 지원서를 삭제했습니다.`);
      } else {
        setAlertInfo({ title: "삭제하지 못했어요", lines: [data.error || "지원서 삭제 중 오류가 발생했습니다."] });
      }
    } catch (err) {
      console.error("삭제 요청 실패:", err);
      showToast("삭제 통신 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const digitsOf = (v) => String(v || "").replace(/\D/g, "").replace(/^0+/, "");

  // 4. 문자: 지원자 정보로 채운 모든 단계 문구를 보여주고, 매니저가 골라서 복사·전송한다
  const handleOpenMessageModal = async (applicant) => {
    setMessageApplicant(applicant);
    setRenderedMessages([]);
    setMessagesError("");
    setSelectedTemplateKey("");
    setCustomMessageText("");
    setCopiedMessage(false);
    setMessagesLoading(true);
    try {
      const data = await callAdmin({ action: "renderMessages", id: identityOf(applicant) });
      if (!data.success) {
        setMessagesError(data.error || "문자 문구를 불러오지 못했어요.");
        return;
      }
      const list = (data.data && data.data.messages) || [];
      setRenderedMessages(list);
      const first = list.find((m) => m.current) || list[0];
      if (first) {
        setSelectedTemplateKey(first.tpl);
        setCustomMessageText(first.text);
      }
    } catch (err) {
      console.error(err);
      setMessagesError("문자 문구를 불러오는 중 오류가 발생했어요. 잠시 뒤 다시 열어 주세요.");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectTemplate = (key) => {
    setSelectedTemplateKey(key);
    if (key === "custom") {
      setCustomMessageText("");
    } else {
      const target = renderedMessages.find((m) => m.tpl === key);
      if (target) setCustomMessageText(target.text);
    }
  };

  const selectedRendered = renderedMessages.find((m) => m.tpl === selectedTemplateKey) || null;

  // 병원 목록 고유값 추출
  const hospitalOptions = useMemo(() => {
    const set = new Set();
    applications.forEach((app) => {
      if (app.hospital && app.hospital !== "병원 미지정") set.add(app.hospital);
    });
    return ["전체", ...Array.from(set)];
  }, [applications]);

  // 고객사 목록 고유값 추출
  const clientOptions = useMemo(() => {
    const set = new Set();
    applications.forEach((app) => {
      const c = getClientName(app);
      if (c && c !== "고객사 미지정") set.add(c);
    });
    return ["전체", ...Array.from(set)];
  }, [applications]);

  // 원고 발행월 목록 추출 (2026-11, 2026-10 등)
  const availableBillingMonths = useMemo(() => {
    const set = new Set();
    applications.forEach((a) => {
      const ym = extractYearMonth(a.postDate);
      if (ym) set.add(ym);
    });
    set.add(currentYearMonth());
    return Array.from(set).sort().reverse();
  }, [applications]);

  // 월별 원고발행 정산·견적 집계 (고객사별 & 병원별 카운팅)
  const monthlyBillingStats = useMemo(() => {
    const targetApps = applications.filter((a) => {
      if (!a.postDate || !a.postDate.trim()) return false;
      if (selectedBillingMonth === "전체") return true;
      return extractYearMonth(a.postDate) === selectedBillingMonth;
    });

    const totalCount = targetApps.length;

    // 고객사별 집계
    const clientMap = {};
    targetApps.forEach((a) => {
      const c = getClientName(a);
      clientMap[c] = (clientMap[c] || 0) + 1;
    });
    const clientBreakdown = Object.entries(clientMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 병원별 집계
    const hospitalMap = {};
    targetApps.forEach((a) => {
      const h = a.hospital || "병원 미지정";
      hospitalMap[h] = (hospitalMap[h] || 0) + 1;
    });
    const hospitalBreakdown = Object.entries(hospitalMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCount,
      clientBreakdown,
      hospitalBreakdown,
      targetApps,
    };
  }, [applications, selectedBillingMonth]);

  // 시트에서 실제로 사용 중인 상태 탭 동적 생성
  const statusTabsList = useMemo(() => {
    const set = new Set();
    applications.forEach((app) => {
      if (app.status && app.status.trim()) set.add(app.status.trim());
    });
    const baseOrder = ["1.신규지원", "2.예약중", "3.체험대기중", "4.포스팅 작성중", "5.원고 검수중", "6.발행완료", "7.드랍"];
    const foundTabs = baseOrder.filter((o) => set.has(o));
    set.forEach((s) => {
      if (!foundTabs.includes(s)) foundTabs.push(s);
    });
    return ["전체", ...foundTabs];
  }, [applications]);

  // 필터링 및 검색
  const filteredApplications = useMemo(() => {
    return applications
      .filter((item) => {
        // 상태 필터 (탭)
        if (selectedStatusTab !== "전체") {
          if (item.status !== selectedStatusTab && !item.status.includes(selectedStatusTab)) {
            return false;
          }
        }
        // 병원 필터
        if (selectedHospital !== "전체" && item.hospital !== selectedHospital) {
          return false;
        }
        // 고객사 필터
        if (selectedClientFilter !== "전체" && getClientName(item) !== selectedClientFilter) {
          return false;
        }
        // 원고 발행월 필터
        if (selectedPostMonthFilter !== "전체") {
          const ym = extractYearMonth(item.postDate);
          if (ym !== selectedPostMonthFilter) return false;
        }
        // 공유상태 필터 (체크박스 필터: 체크 시 룸 공유된 건만 표시)
        if (onlySharedFilter && !isShared(item)) {
          return false;
        }
        // 검색어 필터 (이름, 연락처, 병원, 고객사, 시술, 블로그, 키워드)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const targetStr = `${item.name} ${item.phone} ${item.rawPhone} ${item.hospital} ${item.client} ${item.treatment} ${item.blogUrl} ${item.keyword} ${item.userNote}`.toLowerCase();
          if (!targetStr.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.submittedAt || 0).getTime();
        const timeB = new Date(b.submittedAt || 0).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [applications, selectedStatusTab, selectedHospital, selectedClientFilter, selectedPostMonthFilter, onlySharedFilter, searchQuery, sortOrder]);

  // KPI 통계 계산 (구글 시트 라이프사이클 및 룸 공유에 맞춤)
  const metrics = useMemo(() => {
    const total = applications.length;
    const sharedCount = applications.filter((a) => isShared(a)).length;
    const waitingVisit = applications.filter((a) => a.status.includes("대기") || a.status.includes("확정") || a.status.includes("2.") || a.status.includes("3.")).length;
    const reviewCheck = applications.filter((a) => a.status.includes("검수") || a.status.includes("5.")).length;
    const published = applications.filter((a) => a.status.includes("발행") || a.status.includes("완료") || a.status.includes("6.")).length;
    const dropped = applications.filter((a) => a.status.includes("드랍") || a.status.includes("취소") || a.status.includes("7.")).length;
    return { total, sharedCount, waitingVisit, reviewCheck, published, dropped };
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
      "블로거폴더(가이드룸)",
      "원고발행일",
      "포스팅URL",
      "성과",
      "시술부위설명",
      "지원동기",
      "관리자메모",
    ];

    const rows = filteredApplications.map((a) => [
      `"${a.submittedAt || ""}"`,
      `"${a.status || ""}"`,
      `"${isShared(a) ? "공유됨" : "미공유"}"`,
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
      `"${(a.guideRoom || "").replace(/"/g, '""')}"`,
      `"${(a.postDate || "").replace(/"/g, '""')}"`,
      `"${(a.postUrl || "").replace(/"/g, '""')}"`,
      `"${(a.performance || "").replace(/"/g, '""')}"`,
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

  const monthLabel = (ym) => (ym === "전체" ? "전체 기간" : `${ym.replace("-", "년 ")}월`);
  const hasListFilter =
    selectedPostMonthFilter !== "전체" || selectedClientFilter !== "전체" || selectedHospital !== "전체";
  const clearListFilters = () => {
    setSelectedPostMonthFilter("전체");
    setSelectedClientFilter("전체");
    setSelectedHospital("전체");
    showToast("필터를 해제했습니다.");
  };

  const renderStatusSelect = (item, size = "sm") => (
    <span className={`relative inline-block rounded-full ${statusTone(item.status)}`}>
      <select
        value={item.status}
        onChange={(e) => handleUpdateStatus(item, e.target.value)}
        aria-label={`${item.name}님 진행상태`}
        className={`${size === "sm" ? "h-8 pl-3 pr-9 text-caption" : "h-10 pl-4 pr-10 text-small"} appearance-none bg-transparent text-inherit rounded-full font-semibold cursor-pointer border-0`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.label}>
            {opt.label}
          </option>
        ))}
        {!STATUS_OPTIONS.some((o) => o.label === item.status) && item.status && (
          <option value={item.status}>{item.status}</option>
        )}
      </select>
      <SelectChevron className={size === "sm" ? "right-3" : "right-3.5"} />
    </span>
  );

  const renderShareToggle = (item, compact = false) =>
    compact ? (
      <label
        className="inline-flex items-center justify-center w-9 h-9 rounded-control cursor-pointer hover:bg-fill"
        title={isShared(item) ? "병원 룸에 공유됨" : "체크하면 병원 룸에 바로 공유"}
      >
        <input
          type="checkbox"
          checked={isShared(item)}
          onChange={(e) => handleUpdateShareStatus(item, e.target.checked)}
          aria-label={`${item.name}님 병원 룸 공유`}
          className="w-4 h-4 cursor-pointer accent-brand"
        />
      </label>
    ) : (
    <label
      className={`inline-flex items-center gap-2 h-8 px-2.5 rounded-control cursor-pointer select-none text-caption font-semibold transition-colors ${
        isShared(item) ? "bg-brand-weak text-brand-strong" : "bg-fill text-muted hover:text-sub"
      }`}
      title={isShared(item) ? "병원 룸에 공유됨" : "체크하면 병원 룸에 바로 공유"}
    >
      <input
        type="checkbox"
        checked={isShared(item)}
        onChange={(e) => handleUpdateShareStatus(item, e.target.checked)}
        className="w-4 h-4 cursor-pointer accent-brand"
      />
      <span>{isShared(item) ? "공유됨" : "미공유"}</span>
    </label>
    );

  const linkCls = "text-small font-medium text-brand hover:underline";
  const sectionTitle = "text-small font-semibold text-sub";

  return (
    <div className="min-h-screen bg-fill text-ink flex flex-col">
      {/* 알림 토스트 */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-ink text-white px-5 py-3 rounded-card text-small font-medium shadow-lg max-w-[calc(100vw-2rem)]"
        >
          {toastMessage}
        </div>
      )}

      {/* 상단 바 */}
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center gap-4">
          <h1 className="text-subtitle font-bold text-ink shrink-0">체험단 관리</h1>

          <div className="flex-1 max-w-md hidden md:block">
            <Input
              size="sm"
              type="search"
              placeholder="이름, 연락처, 병원, 블로그 검색"
              aria-label="지원자 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={isRefreshing} aria-label="새로고침">
              <svg className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">{isRefreshing ? "불러오는 중" : "새로고침"}</span>
            </Button>
            {sheetUrl && (
              <Button variant="ghost" size="sm" href={sheetUrl} target="_blank" rel="noreferrer">
                구글 시트
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={downloadCSV} className="hidden sm:inline-flex">
              CSV 저장
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-4">
        {/* 시트 연결 오류 */}
        {loadError && (
          <div className="bg-white rounded-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-body font-semibold text-danger">구글 시트에서 지원자를 불러오지 못했어요</p>
              <p className="text-small text-sub mt-1">{loadError}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchData(true)}>
              다시 시도
            </Button>
          </div>
        )}

        {/* 상태별 건수 = 상태 탭 */}
        <nav aria-label="진행상태" className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {statusTabsList.map((tab) => {
            const count = tab === "전체" ? applications.length : applications.filter((a) => a.status === tab).length;
            const isSelected = selectedStatusTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedStatusTab(tab)}
                aria-pressed={isSelected}
                className={`shrink-0 h-9 px-4 rounded-full text-small font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  isSelected ? "bg-ink text-white" : "bg-white text-sub hover:text-ink"
                }`}
              >
                <span>{tab}</span>
                <span className={isSelected ? "text-white/70" : "text-muted"}>{count}</span>
              </button>
            );
          })}
        </nav>

        {/* 월별 발행 집계 (원고 발행일 기준) */}
        <section className="bg-white rounded-card">
          <button
            type="button"
            onClick={() => setIsBillingOpen((v) => !v)}
            aria-expanded={isBillingOpen}
            className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
          >
            <div>
              <h2 className="text-subtitle font-bold text-ink">월별 발행 집계</h2>
              <p className="text-small text-sub mt-0.5">원고 발행일 기준 · 고객사 견적 청구용</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-small text-sub hidden sm:inline">{monthLabel(selectedBillingMonth)}</span>
              <span className="text-title font-bold text-ink">{monthlyBillingStats.totalCount}명</span>
              <svg className={`w-5 h-5 text-muted transition-transform ${isBillingOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isBillingOpen && (
            <div className="px-5 pb-5 space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {[...availableBillingMonths, "전체"].map((ym) => (
                  <button
                    key={ym}
                    type="button"
                    onClick={() => setSelectedBillingMonth(ym)}
                    aria-pressed={selectedBillingMonth === ym}
                    className={`shrink-0 h-9 px-4 rounded-full text-small font-semibold cursor-pointer transition-colors ${
                      selectedBillingMonth === ym ? "bg-ink text-white" : "bg-fill text-sub hover:text-ink"
                    }`}
                  >
                    {ym === "전체" ? "전체 누적" : monthLabel(ym)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-card bg-fill-weak p-4 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-small text-sub">{monthLabel(selectedBillingMonth)} 발행</p>
                    <p className="text-display font-bold text-ink mt-1">{monthlyBillingStats.totalCount}명</p>
                  </div>
                  <Button
                    variant="weak"
                    size="sm"
                    block
                    onClick={() => {
                      setSelectedPostMonthFilter(selectedBillingMonth);
                      setSelectedClientFilter("전체");
                      setSelectedHospital("전체");
                      showToast(`${monthLabel(selectedBillingMonth)} 발행 완료 지원자만 목록에 표시합니다.`);
                    }}
                  >
                    목록에서 보기
                  </Button>
                </div>

                {[
                  { title: "고객사별", rows: monthlyBillingStats.clientBreakdown, onPick: (name) => setSelectedClientFilter(name) },
                  { title: "병원별", rows: monthlyBillingStats.hospitalBreakdown, onPick: (name) => setSelectedHospital(name) },
                ].map((box) => (
                  <div key={box.title} className="rounded-card bg-fill-weak p-4">
                    <p className="text-small text-sub mb-2">{box.title}</p>
                    {box.rows.length > 0 ? (
                      <ul className="max-h-40 overflow-y-auto -mx-2">
                        {box.rows.map((row) => (
                          <li key={row.name}>
                            <button
                              type="button"
                              onClick={() => {
                                box.onPick(row.name);
                                setSelectedPostMonthFilter(selectedBillingMonth);
                                showToast(`[${row.name}] ${selectedBillingMonth === "전체" ? "" : selectedBillingMonth + "월 "}발행 건만 필터링합니다.`);
                              }}
                              className="w-full flex items-center justify-between gap-2 h-9 px-2 rounded-control text-small hover:bg-white cursor-pointer"
                            >
                              <span className="font-medium text-ink truncate">{row.name}</span>
                              <span className="font-semibold text-ink shrink-0">{row.count}명</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-small text-muted py-4">이 기간에 발행된 원고가 없어요.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 지원자 목록 */}
        <section className="bg-white rounded-card overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-subtitle font-bold text-ink">
                지원자 <span className="text-brand">{filteredApplications.length}</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  className={`inline-flex items-center gap-2 h-10 px-3 rounded-control text-small font-semibold cursor-pointer select-none ${
                    onlySharedFilter ? "bg-brand-weak text-brand-strong" : "bg-fill text-sub"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={onlySharedFilter}
                    onChange={(e) => setOnlySharedFilter(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-brand"
                  />
                  <span>룸 공유만 {metrics.sharedCount}</span>
                </label>
                <Select size="sm" className="!w-auto" value={selectedClientFilter} onChange={(e) => setSelectedClientFilter(e.target.value)} aria-label="고객사">
                  {clientOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "전체" ? "고객사 전체" : c}
                    </option>
                  ))}
                </Select>
                <Select size="sm" className="!w-auto max-w-48" value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} aria-label="병원">
                  {hospitalOptions.map((h) => (
                    <option key={h} value={h}>
                      {h === "전체" ? "병원 전체" : h}
                    </option>
                  ))}
                </Select>
                <Select size="sm" className="!w-auto" value={selectedPostMonthFilter} onChange={(e) => setSelectedPostMonthFilter(e.target.value)} aria-label="원고 발행월">
                  <option value="전체">발행월 전체</option>
                  {availableBillingMonths.map((m) => (
                    <option key={m} value={m}>
                      {monthLabel(m)} 발행
                    </option>
                  ))}
                </Select>
                <Button variant="secondary" size="sm" className="h-10" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                  {sortOrder === "desc" ? "최신순" : "오래된순"}
                </Button>
              </div>
            </div>

            <div className="md:hidden">
              <Input
                size="sm"
                type="search"
                placeholder="이름, 연락처, 병원 검색"
                aria-label="지원자 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {hasListFilter && (
              <div className="flex items-center gap-2 flex-wrap text-small">
                {selectedPostMonthFilter !== "전체" && (
                  <span className="h-8 px-3 inline-flex items-center rounded-full bg-brand-weak text-brand-strong font-medium">
                    {monthLabel(selectedPostMonthFilter)} 발행
                  </span>
                )}
                {selectedClientFilter !== "전체" && (
                  <span className="h-8 px-3 inline-flex items-center rounded-full bg-brand-weak text-brand-strong font-medium">
                    {selectedClientFilter}
                  </span>
                )}
                {selectedHospital !== "전체" && (
                  <span className="h-8 px-3 inline-flex items-center rounded-full bg-brand-weak text-brand-strong font-medium">
                    {selectedHospital}
                  </span>
                )}
                <button type="button" onClick={clearListFilters} className="h-8 px-2 text-sub hover:text-ink underline underline-offset-2 cursor-pointer">
                  필터 해제
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="py-24 text-center" role="status">
              <div className="w-8 h-8 border-[3px] border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-small text-sub">구글 시트에서 지원자를 불러오는 중이에요</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-body font-semibold text-ink-2">조건에 맞는 지원자가 없어요</p>
              <p className="text-small text-sub mt-1">검색어를 바꾸거나 필터를 해제해 보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-y border-line text-caption text-muted">
                    <th className="py-3 pl-5 pr-3 font-medium w-20">룸 공유</th>
                    <th className="py-3 px-3 font-medium w-36">진행상태</th>
                    <th className="py-3 px-3 font-medium min-w-40">지원자</th>
                    <th className="py-3 px-3 font-medium min-w-48">병원 · 시술</th>
                    <th className="py-3 px-3 font-medium min-w-48">희망 일정</th>
                    <th className="py-3 px-3 font-medium min-w-36">자료</th>
                    <th className="py-3 px-3 font-medium w-32">신청일</th>
                    <th className="py-3 pl-3 pr-5 font-medium w-28"><span className="sr-only">작업</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredApplications.map((item, idx) => {
                    const client = getClientName(item);
                    return (
                      <tr
                        key={item.rowId || idx}
                        onClick={() => setActiveItem(item)}
                        className={`align-top cursor-pointer transition-colors ${
                          activeItem?.rowId === item.rowId ? "bg-brand-weak/50" : "hover:bg-fill-weak"
                        }`}
                      >
                        <td className="py-4 pl-5 pr-3" onClick={(e) => e.stopPropagation()}>
                          {renderShareToggle(item, true)}
                        </td>
                        <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                          {renderStatusSelect(item)}
                        </td>
                        <td className="py-4 px-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveItem(item);
                            }}
                            className="text-body font-semibold text-ink hover:text-brand text-left cursor-pointer"
                          >
                            {item.name}
                          </button>
                          {item.ageInfo && <span className="text-caption text-muted ml-1.5">{item.ageInfo}</span>}
                          <div className="flex items-center gap-2 text-sub mt-0.5">
                            <span>{item.phone}</span>
                            {item.phone !== "-" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(item.phone, "전화번호");
                                }}
                                className="text-caption text-muted hover:text-brand cursor-pointer"
                              >
                                복사
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="text-ink font-medium">
                            {item.hospital}
                            {client && client !== "고객사 미지정" && <span className="text-muted font-normal"> · {client}</span>}
                          </div>
                          <div className="text-sub mt-0.5 line-clamp-1">
                            {[item.category, item.treatment].filter(Boolean).join(" · ")}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          {item.confirmedDate ? (
                            <div className="font-semibold text-brand-strong">확정 {item.confirmedDate}</div>
                          ) : (
                            <div className="text-ink">1지망 {item.schedule1 || item.schedules[0] || "-"}</div>
                          )}
                          {!item.confirmedDate && item.schedule2 && <div className="text-sub mt-0.5">2지망 {item.schedule2}</div>}
                        </td>
                        <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-start gap-0.5">
                            {item.blogUrl && (
                              <a href={formatBlogUrl(item.blogUrl)} target="_blank" rel="noreferrer" className={linkCls}>
                                블로그
                              </a>
                            )}
                            {item.guideRoom && (
                              <a href={item.guideRoom} target="_blank" rel="noreferrer" className={linkCls}>
                                블로거 폴더
                              </a>
                            )}
                            {item.postUrl && (
                              <a href={item.postUrl} target="_blank" rel="noreferrer" className={linkCls}>
                                발행글{item.postDate ? ` (${item.postDate.replace(/^\d{4}-/, "")})` : ""}
                              </a>
                            )}
                            {item.imageUrls && item.imageUrls.length > 0 && (
                              <button type="button" onClick={() => setLightboxImage(item.imageUrls[0])} className={`${linkCls} cursor-pointer`}>
                                사진 {item.imageUrls.length}장
                              </button>
                            )}
                            {!item.blogUrl && !item.guideRoom && !item.postUrl && !(item.imageUrls && item.imageUrls.length) && (
                              <span className="text-faint">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-sub whitespace-nowrap">
                          {item.submittedAt ? item.submittedAt.slice(0, 16) : "-"}
                        </td>
                        <td className="py-4 pl-3 pr-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="weak" size="sm" onClick={() => handleOpenMessageModal(item)}>
                              문자
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setItemToDelete(item)} className="text-danger hover:bg-danger-weak">
                              삭제
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* 지원자 상세 패널 */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setActiveItem(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${activeItem.name}님 지원서`}
            className="w-full max-w-lg bg-white h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 머리 */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-title font-bold text-ink">{activeItem.name}님</h2>
                <p className="text-small text-sub mt-0.5 truncate">
                  {activeItem.hospital} · 접수 {activeItem.submittedAt || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                aria-label="닫기"
                className="w-9 h-9 -mr-2 shrink-0 rounded-full text-muted hover:bg-fill hover:text-ink flex items-center justify-center cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* 진행상태 */}
            <div className="px-6 pb-2 flex items-center justify-between gap-3">
              <span className="text-small font-semibold text-sub">진행상태</span>
              {renderStatusSelect(activeItem, "md")}
            </div>

            {/* 탭 */}
            <div role="tablist" className="flex gap-6 px-6 mt-4 border-b border-line">
              {[
                { key: "recruit", label: "모집 정보" },
                { key: "campaign", label: "캠페인 현황" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={drawerTab === t.key}
                  onClick={() => setDrawerTab(t.key)}
                  className={`h-11 -mb-px border-b-2 text-body font-semibold cursor-pointer transition-colors ${
                    drawerTab === t.key ? "border-ink text-ink" : "border-transparent text-muted hover:text-sub"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-6 space-y-8 flex-1 overflow-y-auto">
              {drawerTab === "recruit" && (
                <>
                  {/* 병원 룸 공유 */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={sectionTitle}>
                        병원 룸 공유{activeItem.client ? ` · ${activeItem.client}` : ""}
                      </h3>
                      {renderShareToggle(activeItem)}
                    </div>
                    <p className="text-caption text-sub">체크하면 바로 병원 프로젝트 룸에 올라가요. 블로그지수가 필요해요.</p>
                    <div className="flex items-center gap-3">
                      <label htmlFor={`blogIndex-${activeItem.rowId}`} className="text-small text-sub shrink-0 w-20">
                        블로그지수
                      </label>
                      <Input
                        id={`blogIndex-${activeItem.rowId}`}
                        size="sm"
                        className="!w-40"
                        placeholder="예: 준최4"
                        defaultValue={activeItem.blogIndex || ""}
                        key={`blogIndex-${activeItem.rowId}-${activeItem.blogIndex || ""}`}
                        onBlur={(e) => handleUpdateCampaignField(activeItem, "blogIndex", e.target.value)}
                      />
                    </div>
                  </section>

                  {/* 인적사항 */}
                  <section className="space-y-3">
                    <h3 className={sectionTitle}>인적사항</h3>
                    <dl className="divide-y divide-line">
                      <div className="py-3 flex items-start justify-between gap-3">
                        <dt className="text-small text-sub shrink-0 w-20">연락처</dt>
                        <dd className="flex-1 min-w-0">
                          {editingField === "phone" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                size="sm"
                                type="tel"
                                autoFocus
                                aria-label="연락처"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveContact()}
                              />
                              <Button size="sm" onClick={handleSaveContact}>저장</Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>취소</Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-body font-medium text-ink">{activeItem.phone}</span>
                              <div className="flex items-center gap-3 text-small shrink-0">
                                <button type="button" onClick={() => startEditContact("phone", activeItem.sheetPhone)} className="text-sub hover:text-ink cursor-pointer">수정</button>
                                <button type="button" onClick={() => copyToClipboard(activeItem.phone, "전화번호")} className="text-sub hover:text-ink cursor-pointer">복사</button>
                                <a href={`tel:${activeItem.rawPhone || activeItem.phone}`} className="text-brand hover:underline">전화</a>
                                <a href={`sms:${(activeItem.rawPhone || activeItem.phone).replace(/[^0-9]/g, "")}`} className="text-brand hover:underline">문자</a>
                              </div>
                            </div>
                          )}
                        </dd>
                      </div>
                      <div className="py-3 flex items-start justify-between gap-3">
                        <dt className="text-small text-sub shrink-0 w-20">생년월일</dt>
                        <dd className="flex-1 text-body font-medium text-ink">{activeItem.ageInfo || activeItem.birthdate || "-"}</dd>
                      </div>
                      <div className="py-3 flex items-start justify-between gap-3">
                        <dt className="text-small text-sub shrink-0 w-20">블로그</dt>
                        <dd className="flex-1 min-w-0">
                          {editingField === "blogUrl" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                size="sm"
                                type="url"
                                autoFocus
                                aria-label="블로그 주소"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveContact()}
                                placeholder="https://blog.naver.com/아이디"
                              />
                              <Button size="sm" onClick={handleSaveContact}>저장</Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>취소</Button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              {activeItem.blogUrl ? (
                                <a href={formatBlogUrl(activeItem.blogUrl)} target="_blank" rel="noreferrer" className="text-body font-medium text-brand hover:underline break-all">
                                  {activeItem.blogUrl.replace(/^https?:\/\//, "")}
                                </a>
                              ) : (
                                <span className="text-faint">-</span>
                              )}
                              <button type="button" onClick={() => startEditContact("blogUrl", activeItem.sheetBlog)} className="text-small text-sub hover:text-ink cursor-pointer shrink-0">수정</button>
                            </div>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* 희망 일정 */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={sectionTitle}>희망 일정</h3>
                      {activeItem.confirmedDate && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(activeItem, activeItem.status, "")}
                          className="text-caption text-sub hover:text-ink underline underline-offset-2 cursor-pointer"
                        >
                          확정 취소
                        </button>
                      )}
                    </div>
                    {activeItem.confirmedDate && (
                      <p className="text-small text-ink">
                        확정 예약일 <strong className="font-semibold text-brand-strong">{activeItem.confirmedDate}</strong>
                      </p>
                    )}
                    <div className="space-y-2">
                      {[
                        { priority: "1지망", val: activeItem.schedule1 || activeItem.schedules?.[0] },
                        { priority: "2지망", val: activeItem.schedule2 || activeItem.schedules?.[1] },
                        { priority: "3지망", val: activeItem.schedule3 || activeItem.schedules?.[2] },
                      ]
                        .filter((s) => s.val && s.val.trim() !== "")
                        .map((s, idx) => {
                          const isConfirmed = !!activeItem.confirmedDate && slotKey(activeItem.confirmedDate) === slotKey(s.val);
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between gap-3 p-3 pl-4 rounded-card transition-colors ${
                                isConfirmed ? "bg-brand-weak ring-2 ring-brand" : "bg-fill-weak"
                              }`}
                            >
                              <div className="min-w-0">
                                <span className={`text-caption font-semibold ${isConfirmed ? "text-brand-strong" : "text-muted"}`}>{s.priority}</span>
                                <p className="text-body font-medium text-ink">{s.val}</p>
                              </div>
                              {isConfirmed ? (
                                <span className="text-small font-semibold text-brand-strong shrink-0 px-2">확정됨</span>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="!bg-white"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      activeItem,
                                      !activeItem.status || activeItem.status === "1.신규지원" ? "2.예약중" : activeItem.status,
                                      s.val
                                    )
                                  }
                                >
                                  이 일정으로 확정
                                </Button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </section>

                  {/* 첨부 사진 */}
                  {activeItem.imageUrls && activeItem.imageUrls.length > 0 && (
                    <section className="space-y-3">
                      <h3 className={sectionTitle}>첨부 사진 {activeItem.imageUrls.length}장</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {activeItem.imageUrls.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxImage(url)}
                            aria-label={`사진 ${i + 1} 크게 보기`}
                            className="aspect-square rounded-control overflow-hidden bg-fill cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getDriveThumbnailUrl(url)}
                              alt={`첨부 사진 ${i + 1}`}
                              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x128.png";
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 지원 내용 */}
                  <section className="space-y-3">
                    <h3 className={sectionTitle}>지원 내용</h3>
                    {activeItem.imageNote && (
                      <div>
                        <p className="text-caption text-muted mb-1">시술 부위 설명</p>
                        <p className="text-body text-ink whitespace-pre-wrap">{activeItem.imageNote}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-caption text-muted mb-1">지원동기</p>
                      <p className="text-body text-ink whitespace-pre-wrap">{activeItem.userNote || "적은 내용이 없어요."}</p>
                    </div>
                  </section>

                  {/* 관리자 메모 */}
                  <section>
                    <Field label="관리자 메모" aside="입력칸을 벗어나면 저장돼요">
                      <Textarea
                        rows={3}
                        size="sm"
                        placeholder="병원 전달 특이사항이나 진행 메모"
                        defaultValue={activeItem.memo || ""}
                        key={`recruit-memo-${activeItem.rowId}-${activeItem.memo || ""}`}
                        onBlur={(e) => handleUpdateMemo(activeItem, e.target.value)}
                      />
                    </Field>
                  </section>
                </>
              )}

              {drawerTab === "campaign" && (
                <>
                  {/* 진행 단계 */}
                  <section className="space-y-3">
                    <h3 className={sectionTitle}>진행 단계</h3>
                    <ol className="grid grid-cols-6 gap-1">
                      {[
                        { step: "1.신규", full: "1.신규지원" },
                        { step: "2.예약", full: "2.예약중" },
                        { step: "3.대기", full: "3.체험대기중" },
                        { step: "4.포스팅", full: "4.포스팅 작성중" },
                        { step: "5.검수", full: "5.원고 검수중" },
                        { step: "6.발행", full: "6.발행완료" },
                      ].map((s) => {
                        const isActive = activeItem.status?.includes(s.step.slice(0, 2)) || activeItem.status === s.full;
                        return (
                          <li key={s.step} aria-current={isActive ? "step" : undefined} className="text-center">
                            <div className={`h-1.5 rounded-full ${isActive ? "bg-brand" : "bg-line"}`}></div>
                            <span className={`block mt-2 text-caption truncate ${isActive ? "font-semibold text-brand-strong" : "text-muted"}`}>{s.step}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </section>

                  {/* 예약 · 폴더 */}
                  <section>
                    <dl className="divide-y divide-line">
                      <div className="py-3 flex items-start justify-between gap-3">
                        <dt className="text-small text-sub shrink-0 w-24">내원 예약일</dt>
                        <dd className="flex-1 text-body text-right">
                          {activeItem.confirmedDate ? (
                            <span className="font-semibold text-ink">{activeItem.confirmedDate}</span>
                          ) : (
                            <span className="text-muted">미확정 · 모집 정보 탭에서 확정</span>
                          )}
                        </dd>
                      </div>
                      <div className="py-3 flex items-start justify-between gap-3">
                        <dt className="text-small text-sub shrink-0 w-24">블로거 폴더</dt>
                        <dd className="flex-1 text-right">
                          {activeItem.guideRoom ? (
                            <a href={activeItem.guideRoom} target="_blank" rel="noreferrer" className="text-body font-medium text-brand hover:underline">
                              폴더 열기
                            </a>
                          ) : (
                            <span className="text-body text-muted">아직 없음</span>
                          )}
                          <p className="text-caption text-muted mt-1">
                            {activeItem.guideRoom
                              ? "원고 초안 문서와 비포애프터 이미지 폴더가 들어 있어요. 화면에서는 고칠 수 없어요."
                              : "3.체험대기중이 되면 자동으로 만들어져요."}
                          </p>
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* 발행 정보 */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={sectionTitle}>발행 정보</h3>
                      {activeItem.postUrl && (
                        <a href={activeItem.postUrl} target="_blank" rel="noreferrer" className={linkCls}>
                          발행글 열기
                        </a>
                      )}
                    </div>
                    <Field label="발행글 URL">
                      <Input
                        size="sm"
                        placeholder="https://blog.naver.com/.../1234567890"
                        defaultValue={activeItem.postUrl || ""}
                        key={`postUrl-${activeItem.rowId}-${activeItem.postUrl || ""}`}
                        onBlur={(e) => handleUpdateCampaignField(activeItem, "postUrl", e.target.value)}
                      />
                    </Field>
                    <Field label="원고 발행일" hint="이 날짜의 달로 월별 발행 집계(견적 기준)에 들어가요.">
                      <Input
                        size="sm"
                        placeholder="예: 2026-11-04"
                        defaultValue={activeItem.postDate || ""}
                        key={`postDate-${activeItem.rowId}-${activeItem.postDate || ""}`}
                        onBlur={(e) => handleUpdateCampaignField(activeItem, "postDate", e.target.value)}
                      />
                    </Field>
                  </section>

                  {/* 성과 */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={sectionTitle}>성과</h3>
                      {activeItem.performance && activeItem.performance.startsWith("http") && (
                        <a href={activeItem.performance} target="_blank" rel="noreferrer" className={linkCls}>
                          원본 열기
                        </a>
                      )}
                    </div>
                    <Field label="성과 캡처 이미지 링크" hint="가이드룸에 저장된 노출 순위·조회수 캡처 링크예요.">
                      <Input
                        size="sm"
                        placeholder="https://drive.google.com/file/d/..."
                        defaultValue={activeItem.performance || ""}
                        key={`performance-${activeItem.rowId}-${activeItem.performance || ""}`}
                        onBlur={(e) => handleUpdateCampaignField(activeItem, "performance", e.target.value)}
                      />
                    </Field>
                    {activeItem.performance && activeItem.performance.startsWith("http") && (
                      <button
                        type="button"
                        onClick={() => setLightboxImage(activeItem.performance)}
                        aria-label="성과 캡처 크게 보기"
                        className="w-full aspect-video max-h-40 rounded-card overflow-hidden bg-fill flex items-center justify-center cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getDriveThumbnailUrl(activeItem.performance)}
                          alt="성과 캡처 이미지"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x128.png";
                          }}
                        />
                      </button>
                    )}
                  </section>

                  {/* 메모 */}
                  <section>
                    <Field label="이슈 · 병원 전달 메모" aside="입력칸을 벗어나면 저장돼요">
                      <Textarea
                        rows={3}
                        size="sm"
                        placeholder="진행 중 생긴 이슈나 병원 전달 사항"
                        defaultValue={activeItem.memo || ""}
                        key={`campaign-memo-${activeItem.rowId}-${activeItem.memo || ""}`}
                        onBlur={(e) => handleUpdateMemo(activeItem, e.target.value)}
                      />
                    </Field>
                  </section>
                </>
              )}
            </div>

            {/* 아래 버튼 */}
            <div className="p-4 px-6 border-t border-line flex items-center gap-2">
              <Button variant="dangerWeak" size="lg" onClick={() => setItemToDelete(activeItem)}>
                삭제
              </Button>
              <Button size="lg" block onClick={() => handleOpenMessageModal(activeItem)}>
                문자 보내기
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* 사진 크게 보기 */}
      <Modal
        open={Boolean(lightboxImage)}
        onClose={() => setLightboxImage(null)}
        title="사진"
        size="lg"
        layer={80}
        footer={
          <>
            <Button variant="secondary" href={lightboxImage || undefined} target="_blank" rel="noreferrer">
              구글 드라이브에서 열기
            </Button>
            <Button className="ml-auto" onClick={() => setLightboxImage(null)}>
              닫기
            </Button>
          </>
        }
      >
        {lightboxImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getDriveThumbnailUrl(lightboxImage)} alt="첨부 사진 크게 보기" className="max-w-full max-h-[60vh] mx-auto object-contain rounded-control" />
        )}
      </Modal>

      {/* 문자 보내기 */}
      <Modal
        open={Boolean(messageApplicant)}
        onClose={() => setMessageApplicant(null)}
        title={messageApplicant ? `${messageApplicant.name}님에게 문자` : ""}
        description={messageApplicant ? `${messageApplicant.phone} · ${messageApplicant.hospital}` : ""}
        size="lg"
        layer={60}
        footer={
          messageApplicant && (
            <div className="w-full flex flex-wrap items-center gap-2">
              <Button variant="ghost" href={`tel:${messageApplicant.rawPhone || messageApplicant.phone}`}>
                전화 걸기
              </Button>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(customMessageText);
                    setCopiedMessage(true);
                    setTimeout(() => setCopiedMessage(false), 2000);
                    showToast("메시지를 복사했습니다.");
                  }}
                >
                  {copiedMessage ? "복사했어요" : "복사"}
                </Button>
                <Button
                  href={`sms:${(messageApplicant.rawPhone || messageApplicant.phone).replace(/[^0-9]/g, "")}?body=${encodeURIComponent(customMessageText)}`}
                >
                  문자 앱 열기
                </Button>
              </div>
            </div>
          )
        }
      >
        {messageApplicant && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-small font-semibold text-ink-2">
                단계별 문자 <span className="text-muted font-normal">{renderedMessages.length}건</span>
              </p>
              {messagesLoading && <p className="text-small text-sub">지원자 정보로 문구를 만드는 중이에요…</p>}
              {messagesError && (
                <p className="text-small text-danger-strong bg-danger-weak rounded-control px-3 py-2">{messagesError}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {[
                  ...renderedMessages.map((m) => ({ key: m.tpl, label: `${m.tpl}${m.current ? " · 지금 단계" : ""}` })),
                  { key: "custom", label: "직접 작성" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectTemplate(opt.key)}
                    aria-pressed={selectedTemplateKey === opt.key}
                    className={`h-9 px-4 rounded-full text-small font-semibold cursor-pointer transition-colors ${
                      selectedTemplateKey === opt.key ? "bg-ink text-white" : "bg-fill text-sub hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {selectedRendered && selectedRendered.warn && (
                <p className="text-small text-danger-strong bg-danger-weak rounded-control px-3 py-2">확인: {selectedRendered.warn}</p>
              )}
            </div>

            <Field label="내용" aside={`${customMessageText.length}자`}>
              <Textarea
                rows={9}
                value={customMessageText}
                onChange={(e) => setCustomMessageText(e.target.value)}
                placeholder="보낼 내용을 입력하세요"
              />
            </Field>

            <ul className="text-caption text-sub space-y-1 list-disc pl-4">
              <li>모든 단계의 문구가 이 지원자의 이름·시술·예약일·병원 정보로 채워져 있어요. 보낼 단계를 골라 주세요.</li>
              <li>내용을 고쳐도 시트에는 저장되지 않아요. 복사하거나 문자 앱으로 바로 보내세요.</li>
            </ul>
          </div>
        )}
      </Modal>

      {/* 점검 · 경고 알림 */}
      <Modal
        open={Boolean(alertInfo)}
        onClose={() => setAlertInfo(null)}
        title={alertInfo?.title}
        size="sm"
        layer={70}
        footer={
          <Button size="lg" block onClick={() => setAlertInfo(null)}>
            확인
          </Button>
        }
      >
        {alertInfo && alertInfo.lines.length > 0 && (
          <ul className="space-y-1.5">
            {alertInfo.lines.map((line, i) => (
              <li key={i} className="text-body text-ink-2">
                {line}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* 삭제 확인 */}
      <Modal
        open={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        dismissable={!isDeleting}
        title="지원서를 삭제할까요?"
        description="구글 시트에서도 이 행이 완전히 지워지고 되돌릴 수 없어요."
        size="sm"
        layer={60}
        footer={
          <>
            <Button variant="secondary" size="lg" block onClick={() => setItemToDelete(null)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="danger" size="lg" block onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </>
        }
      >
        {itemToDelete && (
          <dl className="rounded-card bg-fill-weak p-4 space-y-2 text-small">
            <div className="flex justify-between gap-3">
              <dt className="text-sub">지원자</dt>
              <dd className="font-semibold text-ink text-right">
                {itemToDelete.name || "미지정"} ({itemToDelete.phone || "-"})
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-sub shrink-0">병원 · 시술</dt>
              <dd className="text-ink text-right truncate">
                {itemToDelete.hospital} · {itemToDelete.treatment}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-sub">접수</dt>
              <dd className="text-ink text-right">{itemToDelete.submittedAt || "-"}</dd>
            </div>
            {itemToDelete.shareStatus && (
              <div className="flex justify-between gap-3 pt-2 border-t border-line">
                <dt className="text-sub">병원 룸</dt>
                <dd className="font-semibold text-danger text-right">{itemToDelete.shareStatus} · 룸과 연결된 지원자예요</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </div>
  );
}
