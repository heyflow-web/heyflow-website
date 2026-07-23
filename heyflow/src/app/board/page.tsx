import { getInquiries } from '@/lib/notion';
import { dummyBoardData, BoardPost } from '@/lib/dummyBoardData';
import BoardClient from './BoardClient';

export const revalidate = 0; // Always fetch fresh data

export default async function BoardPage() {
  const realInquiries = await getInquiries();
  
  // Update IDs of real inquiries to be higher than dummy data
  // Dummy max ID is 1279, so we start from 1280 + length
  let nextId = 1280 + realInquiries.length - 1;
  const formattedRealInquiries: BoardPost[] = realInquiries.map((inq) => ({
    ...inq,
    displayId: (nextId--).toString(),
  }));

  const notices = dummyBoardData.filter(d => d.isNotice);
  
  const maskText = (text: string) => {
    if (!text) return "고객";
    if (text.length === 1) return text;
    if (text.length === 2) return text.substring(0, 1) + '*';
    if (text.length === 3) return text.substring(0, 1) + '**';
    return text.substring(0, 1) + '**' + text.substring(3);
  };

  const dummyPosts = dummyBoardData.filter(d => !d.isNotice).map(post => ({
    ...post,
    author: maskText(post.author)
  }));

  // Combine: Notices -> Real Inquiries -> Dummy Posts
  const mergedPosts = [...notices, ...formattedRealInquiries, ...dummyPosts];

  return <BoardClient initialData={mergedPosts} />;
}
