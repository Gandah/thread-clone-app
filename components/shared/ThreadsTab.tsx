import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";


interface Props{
    currentUserId: string;
    accountId: string;
    accountType: string;
}

const ThreadsTab = async ({
    currentUserId,
    accountId,
    accountType
}: Props) => {

let results = await fetchUserPosts(accountId)

if(!results) redirect('/')

  return (
    <section className="mt-9 flex flex-col gap-10">
        {results.threads.map((thread: any) => (
            <ThreadCard
            key={thread._id}
            id={thread._id}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            content={thread.text}
            author={accountType === 'User'  //if logged in user display,
        ? { name: results.name,           //display profile image from the database else
             image: results.image,
            id: results.id } : {           // display profile image from thread data
            name: thread.author.name,
            image: thread.author.image,
            id: thread.author.id
        }} //TODO: update users
            community={thread.commmunity}
            createdAt={thread.createdAt}
            comments={thread.children}   
          />
        ))}
    </section>
  )
}

export default ThreadsTab