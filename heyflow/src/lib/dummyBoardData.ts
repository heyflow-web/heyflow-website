export interface BoardPost {
  id: string;
  isNotice: boolean;
  isSecret: boolean;
  title: string;
  author: string;
  date: string;
  likes: number;
  views: number;
}

export const dummyBoardData: BoardPost[] = [
  {
    "id": "notice-1",
    "isNotice": true,
    "isSecret": false,
    "title": "🚨 [필독] 모든 제작/수정 문의는 카카오톡으로 빠르게 도와드립니다!",
    "author": "heyflow",
    "date": "2026.05.04",
    "likes": 0,
    "views": 1702
  },
  {
    "id": "notice-2",
    "isNotice": true,
    "isSecret": false,
    "title": "** 문의사항 글 작성 시 유의사항 **",
    "author": "heyflow",
    "date": "2024.02.14",
    "likes": 0,
    "views": 5057
  },
  {
    "id": "1279",
    "isNotice": false,
    "isSecret": true,
    "title": "유지보수 계약 문의",
    "author": "밀림인테리어",
    "date": "2026.05.04",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1278",
    "isNotice": false,
    "isSecret": true,
    "title": "결제 연동 문의",
    "author": "다원테크",
    "date": "2026.05.03",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1277",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "믹시세라믹",
    "date": "2026.05.01",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1276",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 기능 추가 요청",
    "author": "밀림인테리어",
    "date": "2026.04.30",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1275",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청",
    "author": "법률사무소 DJ",
    "date": "2026.04.30",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1274",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "민컴퍼니",
    "date": "2026.04.29",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1273",
    "isNotice": false,
    "isSecret": true,
    "title": "결제 연동 문의",
    "author": "미래미디어",
    "date": "2026.04.29",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1272",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 기능 추가 요청",
    "author": "다원테크",
    "date": "2026.04.29",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1271",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정사항 요청",
    "author": "다원테크",
    "date": "2026.04.27",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1270",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 문의",
    "author": "파파일라",
    "date": "2026.04.25",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1269",
    "isNotice": false,
    "isSecret": true,
    "title": "디자인 리뉴얼 요청",
    "author": "wsl",
    "date": "2026.04.25",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1268",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 기능 추가 요청",
    "author": "믹시세라믹",
    "date": "2026.04.25",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1267",
    "isNotice": false,
    "isSecret": true,
    "title": "전화번호 변경 요청",
    "author": "멋있다김군",
    "date": "2026.04.23",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1266",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 문의",
    "author": "WSL",
    "date": "2026.04.22",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1265",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 문의",
    "author": "법률사무소 DJ",
    "date": "2026.04.20",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1264",
    "isNotice": false,
    "isSecret": true,
    "title": "전화번호 변경 요청",
    "author": "정석건설",
    "date": "2026.04.19",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1263",
    "isNotice": false,
    "isSecret": true,
    "title": "쇼핑몰 기능 추가 문의",
    "author": "정석건설",
    "date": "2026.04.18",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1262",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 기능 추가 요청",
    "author": "멋있다김군",
    "date": "2026.04.16",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1261",
    "isNotice": false,
    "isSecret": true,
    "title": "유지보수 계약 문의",
    "author": "다원테크",
    "date": "2026.04.16",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1260",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "밀림인테리어",
    "date": "2026.04.15",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1259",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정 요청",
    "author": "정석건설",
    "date": "2026.04.13",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1258",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "경기중앙간호학원",
    "date": "2026.04.11",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1257",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "김은채",
    "date": "2026.04.11",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1256",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정사항 요청",
    "author": "wsl",
    "date": "2026.04.10",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1255",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "파파일라",
    "date": "2026.04.09",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1254",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정 요청",
    "author": "경기중앙간호학원",
    "date": "2026.04.07",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1253",
    "isNotice": false,
    "isSecret": true,
    "title": "유지보수 계약 문의",
    "author": "채선당",
    "date": "2026.04.07",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1252",
    "isNotice": false,
    "isSecret": true,
    "title": "전화번호 변경 요청",
    "author": "김예림",
    "date": "2026.04.07",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1251",
    "isNotice": false,
    "isSecret": true,
    "title": "유지보수 계약 문의",
    "author": "파파일라",
    "date": "2026.04.05",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1250",
    "isNotice": false,
    "isSecret": true,
    "title": "디자인 리뉴얼 요청",
    "author": "채선당",
    "date": "2026.04.05",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1249",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 문의",
    "author": "법률사무소 DJ",
    "date": "2026.04.03",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1248",
    "isNotice": false,
    "isSecret": true,
    "title": "전화번호 변경 요청",
    "author": "풍림특수방수",
    "date": "2026.04.01",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1247",
    "isNotice": false,
    "isSecret": true,
    "title": "디자인 리뉴얼 요청",
    "author": "정석건설",
    "date": "2026.03.30",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1246",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 기능 추가 요청",
    "author": "민컴퍼니",
    "date": "2026.03.28",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1245",
    "isNotice": false,
    "isSecret": true,
    "title": "쇼핑몰 기능 추가 문의",
    "author": "믹시세라믹",
    "date": "2026.03.26",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1244",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정 요청",
    "author": "김예림",
    "date": "2026.03.25",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1243",
    "isNotice": false,
    "isSecret": true,
    "title": "디자인 리뉴얼 요청",
    "author": "김은채",
    "date": "2026.03.23",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1242",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정사항 요청",
    "author": "풍림특수방수",
    "date": "2026.03.23",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1241",
    "isNotice": false,
    "isSecret": true,
    "title": "전화번호 변경 요청",
    "author": "법률사무소 DJ",
    "date": "2026.03.23",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1240",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정 요청",
    "author": "믹시세라믹",
    "date": "2026.03.22",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1239",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정 요청",
    "author": "밀림인테리어",
    "date": "2026.03.20",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1238",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청",
    "author": "법률사무소 DJ",
    "date": "2026.03.19",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1237",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "경기중앙간호학원",
    "date": "2026.03.19",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1236",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "풍림특수방수",
    "date": "2026.03.19",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1235",
    "isNotice": false,
    "isSecret": true,
    "title": "쇼핑몰 기능 추가 문의",
    "author": "법률사무소 DJ",
    "date": "2026.03.19",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1234",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청",
    "author": "정석건설",
    "date": "2026.03.17",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1233",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정사항 요청",
    "author": "채선당",
    "date": "2026.03.16",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1232",
    "isNotice": false,
    "isSecret": true,
    "title": "전화번호 변경 요청",
    "author": "정석건설",
    "date": "2026.03.15",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1231",
    "isNotice": false,
    "isSecret": true,
    "title": "유지보수 계약 문의",
    "author": "다원테크",
    "date": "2026.03.14",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1230",
    "isNotice": false,
    "isSecret": true,
    "title": "결제 연동 문의",
    "author": "멋있다김군",
    "date": "2026.03.12",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1229",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 기능 추가 요청",
    "author": "김은채",
    "date": "2026.03.10",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1228",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 기능 추가 요청",
    "author": "풍림특수방수",
    "date": "2026.03.10",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1227",
    "isNotice": false,
    "isSecret": true,
    "title": "쇼핑몰 기능 추가 문의",
    "author": "김은채",
    "date": "2026.03.10",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1226",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정 요청",
    "author": "액티브에너지",
    "date": "2026.03.08",
    "likes": 0,
    "views": 2
  },
  {
    "id": "1225",
    "isNotice": false,
    "isSecret": true,
    "title": "결제 연동 문의",
    "author": "풍림특수방수",
    "date": "2026.03.08",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1224",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 제작 요청드립니다.",
    "author": "밀림인테리어",
    "date": "2026.03.08",
    "likes": 0,
    "views": 3
  },
  {
    "id": "1223",
    "isNotice": false,
    "isSecret": true,
    "title": "쇼핑몰 기능 추가 문의",
    "author": "믹시세라믹",
    "date": "2026.03.08",
    "likes": 0,
    "views": 1
  },
  {
    "id": "1222",
    "isNotice": false,
    "isSecret": true,
    "title": "홈페이지 수정 요청",
    "author": "풍림특수방수",
    "date": "2026.03.06",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1221",
    "isNotice": false,
    "isSecret": true,
    "title": "결제 연동 문의",
    "author": "김예림",
    "date": "2026.03.04",
    "likes": 0,
    "views": 4
  },
  {
    "id": "1220",
    "isNotice": false,
    "isSecret": true,
    "title": "디자인 리뉴얼 요청",
    "author": "풍림특수방수",
    "date": "2026.03.04",
    "likes": 0,
    "views": 1
  }
];
