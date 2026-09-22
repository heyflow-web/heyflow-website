"use client";

import { useState } from "react";
import Link from "next/link";
import campaignsData from "../../data/campaigns.json";

export default function CampaignListPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // User provided 5 signature color palette with tuned text contrast
  const colorPalette = [
    {
      bg: "#C6D3DC", // Morning Haze
      text: "#1E252B",
      subtext: "#485663",
      tagBg: "rgba(30, 37, 43, 0.08)",
      tagText: "#1E252B",
      offerBg: "rgba(255, 255, 255, 0.65)",
      offerText: "#1E252B",
      buttonBg: "#1E252B",
      buttonText: "#FFFFFF",
    },
    {
      bg: "#6D7A85", // Steel Shadow
      text: "#FFFFFF",
      subtext: "#E2E8F0",
      tagBg: "rgba(255, 255, 255, 0.15)",
      tagText: "#FFFFFF",
      offerBg: "rgba(255, 255, 255, 0.15)",
      offerText: "#FFFFFF",
      buttonBg: "#FFFFFF",
      buttonText: "#1E252B",
    },
    {
      bg: "#262D33", // Night Shadow
      text: "#FFFFFF",
      subtext: "#CBD5E1",
      tagBg: "rgba(255, 255, 255, 0.12)",
      tagText: "#FFFFFF",
      offerBg: "rgba(255, 255, 255, 0.12)",
      offerText: "#FFFFFF",
      buttonBg: "#FFFFFF",
      buttonText: "#262D33",
    },
    {
      bg: "#3B444C", // Urban Slate
      text: "#FFFFFF",
      subtext: "#CBD5E1",
      tagBg: "rgba(255, 255, 255, 0.14)",
      tagText: "#FFFFFF",
      offerBg: "rgba(255, 255, 255, 0.14)",
      offerText: "#FFFFFF",
      buttonBg: "#FFFFFF",
      buttonText: "#3B444C",
    },
    {
      bg: "#D7D6D2", // Pale Sandstone
      text: "#262D33",
      subtext: "#525252",
      tagBg: "rgba(38, 45, 51, 0.08)",
      tagText: "#262D33",
      offerBg: "rgba(255, 255, 255, 0.65)",
      offerText: "#262D33",
      buttonBg: "#262D33",
      buttonText: "#FFFFFF",
    },
  ];

  const categories = [
    "전체",
    "피부클리닉",
    "문제성발톱",
    "재활클리닉",
    "여성클리닉",
    "반영구화장",
    "족부클리닉",
  ];

  const filteredCampaigns =
    selectedCategory === "전체"
      ? campaignsData
      : campaignsData.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16 font-sans overflow-x-hidden w-full">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md mx-auto bg-slate-950 min-h-screen shadow-2xl flex flex-col relative border-x border-slate-800 overflow-x-hidden">
        
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
              Exclusive Campaign
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              체험단 라운지
            </h1>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
            총 {filteredCampaigns.length}개
          </span>
        </header>

        {/* Category Filter Chips */}
        <div className="px-5 py-3.5 overflow-x-auto scrollbar-none flex items-center gap-2 border-b border-slate-800/80 bg-slate-950 sticky top-[65px] z-10 w-full max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-white text-slate-950 shadow-md scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Full Card Overlay Poster List */}
        <main className="p-5 space-y-6 flex-1 w-full max-w-full overflow-hidden">
          {filteredCampaigns.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              해당 카테고리의 캠페인이 없습니다.
            </div>
          ) : (
            filteredCampaigns.map((item, index) => {
              const theme = colorPalette[index % colorPalette.length];
              return (
                <Link
                  key={item.id}
                  href={`/campaigns/${item.id}`}
                  className="group block rounded-[28px] p-5 sm:p-6 min-h-[280px] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between cursor-pointer w-full max-w-full"
                  style={{ backgroundColor: theme.bg }}
                >
                  {/* Top Status & Category Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-bold shadow-xs shrink-0"
                      style={{
                        backgroundColor: theme.tagBg,
                        color: theme.tagText,
                      }}
                    >
                      ● {item.status}
                    </span>

                    <span
                      className="text-[11px] font-extrabold tracking-wider uppercase opacity-80 shrink-0"
                      style={{ color: theme.subtext }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Center Hero Title & Location */}
                  <div className="my-5 min-w-0">
                    <h2
                      className="text-xl sm:text-2xl font-black leading-snug tracking-tight transition-transform group-hover:scale-[1.01] break-keep"
                      style={{ color: theme.text }}
                    >
                      {item.title}
                    </h2>
                    <span
                      className="text-[11px] font-extrabold tracking-wider uppercase block mt-2 opacity-80 break-all"
                      style={{ color: theme.subtext }}
                    >
                      📍 {item.location}
                    </span>
                  </div>

                  {/* Bottom Offer & Action */}
                  <div className="space-y-3 min-w-0 w-full">
                    {/* Offer Box */}
                    <div
                      className="p-3.5 rounded-2xl backdrop-blur-sm shadow-xs flex items-center justify-between min-w-0 w-full overflow-hidden"
                      style={{
                        backgroundColor: theme.offerBg,
                        color: theme.offerText,
                      }}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <span className="text-xs font-bold whitespace-nowrap shrink-0">제공 혜택</span>
                        <span className="text-xs font-bold truncate min-w-0 flex-1">
                          {item.offer}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="flex items-center justify-end gap-2 pt-1 min-w-0 w-full">
                      <button
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 shrink-0 group-hover:scale-105"
                        style={{
                          backgroundColor: theme.buttonBg,
                          color: theme.buttonText,
                        }}
                      >
                        <span>자세히 보기</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </main>

        {/* Footer Notice (Updated Footer Text) */}
        <footer className="px-5 py-6 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950">
          <p className="font-semibold text-slate-400">체험단 플랫폼</p>
          <p className="mt-1 text-[11px] text-slate-600">카드를 클릭하면 상세정보와 지원 자격을 확인하실 수 있습니다.</p>
        </footer>

      </div>
    </div>
  );
}
