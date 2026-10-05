import PostList from '../../components/post-list/PostList';
import { getAllTags } from '../../lib/posts';

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  return <PostList tag={tag} />;
}
