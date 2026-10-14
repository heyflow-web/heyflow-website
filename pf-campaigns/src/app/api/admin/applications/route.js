import { NextResponse } from "next/server";
import { parseRecruitInfo } from "@/lib/parser";

const LATEST_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycby2z4HPw0hxVRq2eVa5mbEtviF8bxcWvkaJgl2q8MDWzmgl49Nix5U9gti_XECcDm6guQ/exec";

const GOOGLE_SHEET_WEBHOOK_URL =
  process.env.GOOGLE_SHEET_WEBHOOK_URL && process.env.GOOGLE_SHEET_WEBHOOK_URL.includes("AKfycby2z4")
    ? process.env.GOOGLE_SHEET_WEBHOOK_URL
    : LATEST_WEBHOOK_URL;

// 구글 앱스 스크립트 새 배포 전에도 대시보드를 즉시 검토할 수 있는 표준 샘플 데이터
const MOCK_APPLICATIONS = [
  {
    rowId: 2,
    submittedAt: "2026-10-07 14:15:30",
    status: "1.신규지원",
    shareStatus: "공유됨",
    client: "큐어람",
    confirmedDate: "",
    memo: "얼굴 및 목 편평사마귀 50개 내외 희망",
    ...parseRecruitInfo(`[큐어람한의원/편평사마귀제거]
이름 : 이서연
연락처 : 010-8821-4920
생년월일 : 940512
블로그주소 : https://blog.naver.com/sy_daily_beauty
희망시술 : 편평사마귀 제거 시술 (얼굴·목 최대 100개 무상 지원)
희망예약일자 :
- 1지망 : 2026-10-15 14:00 (오후)
- 2지망 : 2026-10-15 16:30 (오후)
- 3지망 : 2026-10-16 11:00 (오전)
시술부위 상세설명 : 눈가 및 목 주변 좁쌀 형태 편평사마귀 50여개 집중 고민
첨부사진URL :
https://drive.google.com/file/d/1_sample_flatwart_cureram_01/view
https://drive.google.com/file/d/1_sample_flatwart_cureram_02/view
특이사항 : 뷰티/피부과 위주 일방문자 800명 이상 유지 중입니다. 꼼꼼하고 가이드라인에 맞춘 전후 정성 리뷰 약속드립니다.`),
  },
  {
    rowId: 3,
    submittedAt: "2026-10-06 17:38:00",
    status: "3.체험대기중",
    shareStatus: "공유됨",
    client: "오블리브",
    confirmedDate: "2026-10-12 14:00 (오후)",
    memo: "1지망 일정으로 병원 예약 접수 완료됨",
    ...parseRecruitInfo(`[오블리브송도/문제성발톱]
이름 : miyeon kim
연락처 : 01047591288
생년월일 : 932004
블로그주소 : https://blog.naver.com/miyeon_log
희망시술 : [A타입] 발톱 무좀 케어: 전문 장비를 활용한 균 제거 및 비가열성 맞춤 관리
희망예약일자 :
- 1지망 : 2026-10-12 14:00 (오후)
- 2지망 : 2026-10-12 15:00 (오후)
- 3지망 : 2026-10-12 16:00 (오후)
시술부위 상세설명 : 엄지발톱 변색 및 두꺼워짐 (오른쪽)
첨부사진URL :
https://drive.google.com/file/d/1_sample_obliv_toenail_01/view
특이사항 : 송도 거주 중이라 언제든 내원 가능합니다. 깔끔한 사진과 영상으로 작성할게요.`),
  },
  {
    rowId: 4,
    submittedAt: "2026-10-05 11:20:15",
    status: "6.발행완료",
    shareStatus: "공유됨",
    client: "온리프",
    confirmedDate: "2026-10-08 11:30 (오전)",
    postDate: "2026-10-25",
    postUrl: "https://blog.naver.com/mw_review_lab/223610291",
    keyword: "온리프 피부클리닉, 여드름 흉터치료 후기",
    guideRoom: "https://drive.google.com/drive/folders/sample_onleaf_folder",
    draftUrl: "https://blog.naver.com/draft/sample1",
    performance: "스마트블록 1위 노출 (조회수 1,420회)",
    memo: "시술 완료 및 10월 정기 발행 완료",
    ...parseRecruitInfo(`[온리프/피부클리닉]
이름 : 정민우
연락처 : 01039401928
생년월일 : 911104
블로그주소 : https://blog.naver.com/mw_review_lab
희망시술 : 흉터 치료 클리닉 - 일반 흉터, 함몰 흉터, 파인 흉터, 여드름 흉터 등
희망예약일자 :
- 1지망 : 2026-10-08 11:30 (오전)
- 2지망 : 2026-10-08 14:00 (오후)
- 3지망 : 2026-10-09 15:00 (오후)
시술부위 상세설명 : 볼 부위 3cm 여드름 패인 흉터 2곳
첨부사진URL :
https://drive.google.com/file/d/1_sample_onleaf_scar_01/view
특이사항 : 2회 내원 및 전후 경과 사진 꼼꼼하게 포스팅 완료되었습니다.`),
  },
  {
    rowId: 5,
    submittedAt: "2026-10-04 16:45:10",
    status: "1.신규지원",
    shareStatus: "미공유",
    client: "르샤인",
    confirmedDate: "",
    memo: "",
    ...parseRecruitInfo(`[르샤인/피부클리닉]
이름 : 김다희
연락처 : 01042151016
생년월일 : 891030
블로그주소 : https://blog.naver.com/d_ahee_iary
희망시술 : 명함 크기 소형 문신 / 타투 제거 레이저 시술
희망예약일자 :
- 1지망 : 2026-10-18 12:00 (오후)
- 2지망 : 2026-10-18 14:30 (오후)
- 3지망 : 2026-10-19 16:00 (오후)
시술부위 상세설명 : 손목 4cm 레터링 타투
첨부사진URL :
https://drive.google.com/file/d/1_sample_leshine_tattoo_01/view
특이사항 : 릴스 및 블로그 동시 노출 가능합니다!`),
  },
  {
    rowId: 6,
    submittedAt: "2026-10-03 10:20:00",
    status: "6.발행완료",
    shareStatus: "공유됨",
    client: "살만",
    confirmedDate: "2026-10-20 14:00",
    postDate: "2026-11-04",
    postUrl: "https://blog.naver.com/salman_review/223650012",
    keyword: "살만드림의원, 슈링크 유니버스, 피부탄력 리프팅",
    guideRoom: "https://drive.google.com/drive/folders/sample_salman_dream",
    draftUrl: "https://blog.naver.com/draft/sample_salman1",
    performance: "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x128.png",
    memo: "11월 살만 견적 청구 대상 (발행완료)",
    ...parseRecruitInfo(`[살만드림의원/리프팅]
이름 : 고보경
연락처 : 010-9281-3012
생년월일 : 920815
블로그주소 : https://blog.naver.com/salman_review
희망시술 : 슈링크 유니버스 리프팅 300샷 무상 시술
희망예약일자 :
- 1지망 : 2026-10-20 14:00
- 2지망 : 2026-10-21 15:00
시술부위 상세설명 : 턱선 및 볼 탄력 저하 고민
특이사항 : 11월 4일 발행완료되었습니다.`),
  },
  {
    rowId: 7,
    submittedAt: "2026-10-02 11:00:00",
    status: "6.발행완료",
    shareStatus: "공유됨",
    client: "살만",
    confirmedDate: "2026-10-22 15:30",
    postDate: "2026-11-08",
    postUrl: "https://blog.naver.com/salman_skin/223650890",
    keyword: "살만연세의원, 잡티제거 레이저토닝",
    guideRoom: "https://drive.google.com/drive/folders/sample_salman_yonsei",
    draftUrl: "https://blog.naver.com/draft/sample_salman2",
    performance: "네이버 VIEW 1위 / 스마트블록 노출",
    memo: "11월 살만 견적 청구 대상 (발행완료)",
    ...parseRecruitInfo(`[살만연세의원/토닝]
이름 : 최서연
연락처 : 010-3341-9920
생년월일 : 950419
블로그주소 : https://blog.naver.com/salman_skin
희망시술 : 피코토닝 + 잡티 듀얼 레이저
희망예약일자 :
- 1지망 : 2026-10-22 15:30
시술부위 상세설명 : 양볼 기미 잡티 고민
특이사항 : 11월 8일 원고 발행 완료.`),
  },
  {
    rowId: 8,
    submittedAt: "2026-10-01 09:30:00",
    status: "6.발행완료",
    shareStatus: "공유됨",
    client: "큐어람",
    confirmedDate: "2026-10-18 11:00",
    postDate: "2026-11-10",
    postUrl: "https://blog.naver.com/cureram_clinic/223651120",
    keyword: "큐어람한의원, 편평사마귀 한방제거",
    guideRoom: "https://drive.google.com/drive/folders/sample_cureram_folder",
    draftUrl: "https://blog.naver.com/draft/sample_cureram",
    performance: "조회수 1,280회",
    memo: "11월 큐어람 견적 청구 대상 (발행완료)",
    ...parseRecruitInfo(`[큐어람한의원/사마귀치료]
이름 : 박지은
연락처 : 010-5512-8823
생년월일 : 901201
블로그주소 : https://blog.naver.com/cureram_clinic
희망시술 : 한방 편평사마귀 제거 프로그램
희망예약일자 :
- 1지망 : 2026-10-18 11:00
시술부위 상세설명 : 목 주변 사마귀
특이사항 : 11월 10일 정성 후기 발행 완료.`),
  },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    let sheetData = null;
    let isLiveSheet = false;
    let isScriptOutdated = false;

    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const fetchUrl = `${GOOGLE_SHEET_WEBHOOK_URL}?action=applications&t=${Date.now()}`;
        const res = await fetch(fetchUrl, {
          method: "GET",
          redirect: "follow",
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        });

        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json.rows) && json.rows.length > 0) {
            // 구글 시트에서 최신 행 목록을 정상 수신한 경우
            sheetData = json.rows.map((row, idx) => {
              const rowId = row.rowId || idx + 2;
              const submittedAt = row.submittedAt || row.date || "";
              const recruitInfoText = row.recruitInfo || row.rawInfo || "";
              const status = row.status || "대기중";
              const confirmedDate = row.confirmedDate || "";
              const memo = row.memo || "";

              const parsed = parseRecruitInfo(recruitInfoText, {
                hospital: row.hospital,
                category: row.category,
                name: row.name,
                phone: row.phone,
                birthdate: row.birthdate,
                blogUrl: row.blogUrl,
                treatment: row.treatment,
                schedule1: row.schedule1,
                schedule2: row.schedule2,
                schedule3: row.schedule3,
                imageNote: row.imageNote,
                images: row.images,
                userNote: row.userNote,
              });

              return {
                rowId,
                submittedAt,
                status,
                confirmedDate,
                guideRoom: row.guideRoom || "",
                draftUrl: row.draftUrl || "",
                postDate: row.postDate || "",
                postUrl: row.postUrl || "",
                keyword: row.keyword || "",
                performance: row.performance || "",
                memo,
                shareStatus: (function (v) {
                  if (!v) return "";
                  const s = String(v).trim();
                  if (s === "TRUE" || s === "true" || s === "공유됨" || s === "공유완료") return "공유됨";
                  if (s === "제외" || s === "FALSE" || s === "false" || s === "미공유") return "";
                  return s;
                })(row.shareStatus),
                client: row.client || "",
                syncKey: row.syncKey || "",
                checkStatus: row.checkStatus || "",
                roomSyncVal: row.roomSyncVal || "",
                ...parsed,
              };
            });
            isLiveSheet = true;
          } else if (json.result === "success" && !json.rows) {
            // 기존 doGet 함수(단순 성공 메시지만 반환하는 구버전 스크립트)
            isScriptOutdated = true;
          }
        } catch (parseErr) {
          console.warn("구글 스크립트 JSON 파싱 예외:", text.substring(0, 100));
        }
      } catch (fetchErr) {
        console.warn("구글 시트 웹앱 조회 통신 지연/오류:", fetchErr.message);
      }
    }

    const applications = isLiveSheet && sheetData ? sheetData : MOCK_APPLICATIONS;

    return NextResponse.json({
      success: true,
      isLiveSheet,
      isScriptOutdated,
      totalCount: applications.length,
      applications,
      scriptUrl: GOOGLE_SHEET_WEBHOOK_URL,
      sheetUrl: "https://docs.google.com/spreadsheets/d/1kjwDdMS8AIspbWnDF2ILAlewOA7Dcyp-zk1hE29rbu8/edit?usp=sharing",
    });
  } catch (error) {
    console.error("Admin applications API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action,
      rowId,
      status,
      confirmedDate,
      memo,
      shareStatus,
      guideRoom,
      draftUrl,
      postDate,
      postUrl,
      keyword,
      performance,
    } = body;

    if (action === "deleteRow" && GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const delRes = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "deleteRow",
            rowId,
          }),
        });
        const resText = await delRes.text();
        console.log("시트 행 삭제 응답:", resText);
      } catch (err) {
        console.warn("시트 행 삭제 에러:", err);
      }

      return NextResponse.json({
        success: true,
        message: "지원서가 성공적으로 삭제되었습니다.",
        deletedRowId: rowId,
      });
    }

    if (action === "updateRow" && GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const updateRes = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "updateStatus",
            rowId,
            status,
            confirmedDate,
            memo,
            shareStatus,
            guideRoom,
            draftUrl,
            postDate,
            postUrl,
            keyword,
            performance,
          }),
        });
        const resText = await updateRes.text();
        console.log("시트 상태 업데이트 응답:", resText);
      } catch (err) {
        console.warn("시트 상태 업데이트 전송 에러:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "상태가 성공적으로 업데이트되었습니다.",
      updated: {
        rowId,
        status,
        confirmedDate,
        memo,
        shareStatus,
        guideRoom,
        draftUrl,
        postDate,
        postUrl,
        keyword,
        performance,
      },
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
