import { NextResponse } from 'next/server';
import { createInquiry } from '@/lib/notion';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, contact, email, budget, schedule, inquiry } = body;

    // Save to Notion Database
    await createInquiry({ name, company, contact, email, budget, schedule, inquiry });

    return NextResponse.json({ success: true, message: 'Inquiry saved successfully to Notion.' });
  } catch (error: any) {
    console.error('Error saving inquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
