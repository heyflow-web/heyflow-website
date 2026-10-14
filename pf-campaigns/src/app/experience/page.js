"use client";

import { useState } from "react";
import Link from "next/link";
import campaignsData from "../../data/campaigns.json";

export default function CampaignListPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const categories = [
    "전체",
    "편평사마귀제거",
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
    <div className="min-h-screen bg-fill w-full overflow-x-clip">
      <div className="w-full max-w-md md:max-w-5xl mx-auto min-h-screen flex flex-col md:px-4">
        <header className="px-5 pt-10 pb-4">
          <h1 className="text-display font-bold text-ink">체험단 캠페인</h1>
          <p className="text-body text-sub mt-1">지금 {filteredCampaigns.length}개 캠페인이 모집 중이에요</p>
        </header>

        {/* 카테고리 */}
        <nav aria-label="카테고리" className="sticky top-0 z-20 bg-fill px-5 py-3 overflow-x-auto scrollbar-none flex items-center gap-2 md:flex-wrap md:overflow-visible">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`shrink-0 h-9 px-4 rounded-full text-small font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat ? "bg-ink text-white" : "bg-white text-sub hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <main className="flex-1 px-5 pt-2 pb-10">
          {filteredCampaigns.length === 0 ? (
            <p className="py-20 text-center text-body text-muted">이 카테고리에는 모집 중인 캠페인이 없어요.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCampaigns.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/experience/${item.id}`}
                    className="h-full flex flex-col bg-white rounded-card p-5 transition-transform active:scale-[0.98] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-brand-weak text-brand-strong text-caption font-semibold">
                        {item.status}
                      </span>
                      <span className="text-caption text-muted truncate">{item.category}</span>
                    </div>
                    <h2 className="text-title font-bold text-ink mt-3">{item.title}</h2>
                    <p className="text-small text-sub mt-1 mb-4">{item.location}</p>
                    <div className="mt-auto pt-4 border-t border-line flex items-center gap-3 min-w-0">
                      <span className="text-caption text-muted shrink-0">제공 혜택</span>
                      <span className="text-small font-semibold text-ink-2 truncate flex-1">{item.offer}</span>
                      <svg className="w-5 h-5 text-faint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>

        <footer className="px-5 py-8 text-caption text-sub">
          캠페인을 누르면 혜택과 지원 조건을 볼 수 있어요.
        </footer>
      </div>
    </div>
  );
}
