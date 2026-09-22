"use client";

import { use, useState } from "react";
import Link from "next/link";
import campaignsData from "../../../data/campaigns.json";
import ApplyModal from "@/components/ApplyModal";

export default function CampaignDetailPage({ params }) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const campaign = campaignsData.find((c) => c.id === campaignId);

  // User provided 5 signature color palette for header accent
  const colorPalette = [
    { bg: "#C6D3DC", text: "#1E252B", tagBg: "rgba(30, 37, 43, 0.08)", tagText: "#1E252B" }, // Morning Haze
    { bg: "#6D7A85", text: "#FFFFFF", tagBg: "rgba(255, 255, 255, 0.18)", tagText: "#FFFFFF" }, // Steel Shadow
    { bg: "#262D33", text: "#FFFFFF", tagBg: "rgba(255, 255, 255, 0.15)", tagText: "#FFFFFF" }, // Night Shadow
    { bg: "#3B444C", text: "#FFFFFF", tagBg: "rgba(255, 255, 255, 0.15)", tagText: "#FFFFFF" }, // Urban Slate
    { bg: "#D7D6D2", text: "#262D33", tagBg: "rgba(38, 45, 51, 0.08)", tagText: "#262D33" }, // Pale Sandstone
  ];

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold mb-4">존재하지 않는 캠페인입니다.</h2>
        <Link
          href="/campaigns"
          className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-full text-sm"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const campaignIndex = campaignsData.findIndex((c) => c.id === campaignId);
  const theme = colorPalette[campaignIndex % colorPalette.length];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans overflow-x-hidden w-full">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md mx-auto bg-white min-h-screen shadow-xl flex flex-col relative border-x border-slate-200/60 overflow-x-hidden">
        
        {/* Navigation Header */}
        <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <Link
            href="/campaigns"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>목록으로</span>
          </Link>
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            {campaign.category}
          </span>
        </nav>

        {/* Hero Cover Header */}
        <div
          className="p-6 pt-8 pb-10 relative overflow-hidden flex flex-col justify-between"
          style={{ backgroundColor: theme.bg }}
        >
          {/* Status Badge */}
          <div className="mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-xs"
              style={{ backgroundColor: theme.tagBg, color: theme.tagText }}
            >
              ● {campaign.status}
            </span>
          </div>

          {/* Campaign Main Title */}
          <h1
            className="text-2xl font-black leading-snug tracking-tight my-1"
            style={{ color: theme.text }}
          >
            {campaign.title}
          </h1>

          {/* Category & Location */}
          <p
            className="text-xs font-bold tracking-wider uppercase opacity-80 mt-2"
            style={{ color: theme.text }}
          >
            {campaign.category} · {campaign.location}
          </p>
        </div>

        {/* Toss-Style Clean Light Body */}
        <main className="p-6 space-y-9 flex-1 bg-white">
          
          {/* 1. 🧡 체험 혜택 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>🧡</span>
              <span>체험 혜택</span>
            </h3>

            <div className="text-xl font-black text-slate-900 tracking-tight leading-snug pt-1">
              {campaign.offer}
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              {campaign.benefits?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 2. 📸 리뷰 미션 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>📸</span>
              <span>리뷰 미션</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {campaign.missions?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 font-medium">
                  <span className="text-indigo-600 font-bold mt-0.5">-</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 3. ✔️ 신청 조건 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>✔️</span>
              <span>신청 조건</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-600 pt-1">
              {campaign.conditions?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">-</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 4. ⚠️ 필수 유의사항 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-amber-700 tracking-tight flex items-center gap-1.5">
              <span>⚠️</span>
              <span>필수 유의사항</span>
            </h3>

            <div className="space-y-2 text-xs text-amber-900/90 bg-amber-50/70 p-4 rounded-2xl border border-amber-100 leading-relaxed">
              {campaign.notices?.map((item, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">-</span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 5. 📅 일정 및 활동 */}
          {campaign.schedule && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>📅</span>
                <span>일정 및 활동</span>
              </h3>

              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p>
                  <strong className="text-slate-900">▶ 발표:</strong> {campaign.schedule.announcement}
                </p>
                <p>
                  <strong className="text-slate-900">▶ 활동:</strong> {campaign.schedule.activity}
                </p>
              </div>
            </section>
          )}

        </main>

        {/* Fixed Bottom Apply Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>캠페인 지원하기</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* In-App Recruitment Apply Modal */}
        <ApplyModal
          campaign={campaign}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Footer */}
        <footer className="px-5 py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-slate-50">
          <p className="font-semibold text-slate-600">체험단 플랫폼</p>
          <p className="mt-1 text-[11px] text-slate-400">캠페인 상세 조건을 확인하신 후 신청해 주세요.</p>
        </footer>

      </div>
    </div>
  );
}
