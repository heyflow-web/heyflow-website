import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 항상 최신 데이터를 가져오도록 설정

export async function GET() {
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const API_KEY = process.env.NOTION_API_KEY;

  if (!DATABASE_ID || !API_KEY) {
    return NextResponse.json({
      status: 'error',
      message: '환경 변수가 누락되었습니다.',
      NOTION_DATABASE_ID_EXISTS: !!DATABASE_ID,
      NOTION_API_KEY_EXISTS: !!API_KEY,
    });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({
        status: 'error',
        message: 'Notion API 호출에 실패했습니다.',
        statusCode: res.status,
        statusText: res.statusText,
        notionError: errorText,
        API_KEY_LENGTH: API_KEY.length,
        API_KEY_STARTS_WITH: API_KEY.substring(0, 4),
        DATABASE_ID_LENGTH: DATABASE_ID.length,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      status: 'success',
      message: 'Notion API 호출 성공!',
      totalProjects: data.results?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: '서버 내부 오류가 발생했습니다.',
      error: error.message,
    });
  }
}
