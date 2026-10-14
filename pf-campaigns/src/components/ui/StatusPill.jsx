// 진행상태 7가지의 색. 상태 문자열 자체는 시트 값이라 여기서 바꾸지 않는다.
export const statusTone = (status) => {
  const s = status || "";
  if (s.includes("발행") || s.includes("6.")) return "bg-success-weak text-success-strong";
  if (s.includes("검수") || s.includes("5.")) return "bg-violet-weak text-violet-strong";
  if (s.includes("포스팅") || s.includes("4.")) return "bg-teal-weak text-teal-strong";
  if (s.includes("대기") || s.includes("3.")) return "bg-warn-weak text-warn-strong";
  if (s.includes("예약") || s.includes("2.")) return "bg-brand-weak text-brand-strong";
  if (s.includes("신규") || s.includes("1.")) return "bg-fill text-ink-2";
  if (s.includes("드랍") || s.includes("취소") || s.includes("7.")) return "bg-danger-weak text-danger-strong";
  return "bg-fill text-sub";
};

export default function StatusPill({ status, className = "" }) {
  return (
    <span className={`inline-flex items-center h-7 px-2.5 rounded-full text-caption font-semibold whitespace-nowrap ${statusTone(status)} ${className}`}>
      {status || "-"}
    </span>
  );
}
