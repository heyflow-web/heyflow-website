import { getInquiries } from '@/lib/notion';
import { dummyBoardData, BoardPost } from '@/lib/dummyBoardData';
import BoardClient from './BoardClient';

export const revalidate = 0; // Always fetch fresh data

export default async function BoardPage() {
  const realInquiries = await getInquiries();
  
  const notices = realInquiries.filter(inq => inq.isNotice);
  const normalRealInquiries = realInquiries.filter(inq => !inq.isNotice);

  let nextId = 47 + normalRealInquiries.length;
  const formattedRealInquiries: BoardPost[] = normalRealInquiries.map((inq) => ({
    ...inq,
    displayId: (nextId--).toString(),
  }));
  
  const maskText = (text: string) => {
    if (!text) return "고객";
    if (text.length === 1) return text;
    if (text.length === 2) return text.substring(0, 1) + '*';
    if (text.length === 3) return text.substring(0, 1) + '**';
    return text.substring(0, 1) + '**' + text.substring(3);
  };

  const projectTypes = ["반응형 웹사이트", "랜딩페이지", "제품 상세페이지", "온라인 배너(SNS 에셋 등)"];

  let dummyId = 47;
  const dummyPosts = dummyBoardData.filter(d => !d.isNotice).slice(0, 47).map((post, i) => {
    const type = projectTypes[i % projectTypes.length];
    return {
      ...post,
      displayId: (dummyId--).toString(),
      title: `${type} 문의가 작성되었어요.`,
      author: maskText(post.author)
    };
  });

  // Combine: Notices -> Real Inquiries -> Dummy Posts
  const mergedPosts = [...notices, ...formattedRealInquiries, ...dummyPosts];

  return <BoardClient initialData={mergedPosts} />;
}
