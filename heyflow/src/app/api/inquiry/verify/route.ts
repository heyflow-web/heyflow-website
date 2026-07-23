import { NextResponse } from 'next/server';
import { verifyInquiry } from '@/lib/notion';

export async function POST(req: Request) {
  try {
    const { id, phone } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: '글 ID가 필요합니다.' }, { status: 400 });
    }

    const result = await verifyInquiry(id, phone);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error: any) {
    console.error('Error in verify API:', error);
    return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
