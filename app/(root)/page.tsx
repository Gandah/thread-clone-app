import { fetchPosts } from "@/lib/actions/thread.actions";
import { UserButton, currentUser } from "@clerk/nextjs";

import ThreadCard from "@/components/cards/ThreadCard";
 

export default async function Home() {

  const results  = await fetchPosts(1, 30);
  const user = await currentUser();

  return (
    <>
      {/* <UserButton afterSignOutUrl="/"/> */}
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {results.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {results.posts.map((post ) => (
              <ThreadCard
               key={post._id}
               id={post._id}
               currentUserId={user?.id || ""}
               parentId={post.parentId}
               content={post.text}
               author={post.author}
               community={post.commmunity}
               createdAt={post.createdAt}
               comments={post.children}
               />
            )

            )}
          </>
        )}

      </section>
    </>
  )
}
