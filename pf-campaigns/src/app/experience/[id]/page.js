"use client";

import { use, useState } from "react";
import Link from "next/link";
import campaignsData from "../../../data/campaigns.json";
import ApplyModal from "@/components/ApplyModal";
import Button from "@/components/ui/Button";

export default function CampaignDetailPage({ params }) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const campaign = campaignsData.find((c) => c.id === campaignId);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-title font-bold text-ink">찾는 캠페인이 없어요</h1>
        <p className="text-body text-sub mt-2">모집이 끝났거나 주소가 바뀌었을 수 있어요.</p>
        <Button href="/experience" variant="secondary" className="mt-6">
          캠페인 목록 보기
        </Button>
      </div>
    );
  }

  const sectionTitle = "text-subtitle font-bold text-ink";
  const listCls = "space-y-2 text-body text-ink-2";

  return (
    <div className="min-h-screen bg-fill w-full overflow-x-clip">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col pb-28">
        <nav className="sticky top-0 z-30 bg-white h-14 px-2 flex items-center">
          <Link
            href="/experience"
            aria-label="목록으로"
            className="w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-fill"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </nav>

        <header className="px-5 pt-2 pb-6">
          <p className="text-small font-semibold text-brand">{campaign.status}</p>
          <h1 className="text-display font-bold text-ink mt-2">{campaign.title}</h1>
          <p className="text-body text-sub mt-2">
            {campaign.category} · {campaign.location}
          </p>
        </header>

        <main className="px-5 space-y-10 flex-1">
          {/* 체험 혜택 */}
          <section className="rounded-card bg-fill-weak p-5">
            <h2 className="text-small font-semibold text-sub">체험 혜택</h2>
            <p className="text-title font-bold text-ink mt-1">{campaign.offer}</p>
            {campaign.benefits?.length > 0 && (
              <ul className="mt-4 pt-4 border-t border-line space-y-1.5 text-small text-sub list-disc pl-4">
                {campaign.benefits.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          {campaign.missions?.length > 0 && (
            <section className="space-y-3">
              <h2 className={sectionTitle}>리뷰 미션</h2>
              <ul className={`${listCls} list-disc pl-5`}>
                {campaign.missions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {campaign.conditions?.length > 0 && (
            <section className="space-y-3">
              <h2 className={sectionTitle}>신청 조건</h2>
              <ul className={`${listCls} list-disc pl-5`}>
                {campaign.conditions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {campaign.notices?.length > 0 && (
            <section className="space-y-3">
              <h2 className={sectionTitle}>꼭 확인해 주세요</h2>
              <ul className="rounded-card bg-danger-weak p-5 space-y-2 text-small text-ink-2 list-disc pl-9">
                {campaign.notices.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {campaign.schedule && (
            <section className="space-y-3">
              <h2 className={sectionTitle}>일정</h2>
              <dl className="divide-y divide-line text-body">
                <div className="py-3 flex gap-4">
                  <dt className="text-sub w-12 shrink-0">발표</dt>
                  <dd className="text-ink">{campaign.schedule.announcement}</dd>
                </div>
                <div className="py-3 flex gap-4">
                  <dt className="text-sub w-12 shrink-0">활동</dt>
                  <dd className="text-ink">{campaign.schedule.activity}</dd>
                </div>
              </dl>
            </section>
          )}
        </main>

        {/* 아래 고정 지원 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto px-5 pt-3 pb-5 bg-gradient-to-t from-white from-70% to-white/0">
          <Button size="lg" block onClick={() => setIsModalOpen(true)}>
            지원하기
          </Button>
        </div>

        <ApplyModal campaign={campaign} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
}
