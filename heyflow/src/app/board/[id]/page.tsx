import BoardDetailClient from './BoardDetailClient';

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  return <BoardDetailClient id={params.id} />;
}
