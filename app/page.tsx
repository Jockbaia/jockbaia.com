import PostList from './components/post-list/PostList';

export default function Home() {
  return (
    <>
      <a
        rel="me"
        href="https://pan.rent/@jockbaia"
        tabIndex={-1}
        aria-hidden="true"
      />
      <PostList />
    </>
  );
}
