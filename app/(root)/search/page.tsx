import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";

import { redirect } from "next/navigation";
import UserCard from "@/components/cards/UserCard";

const Page = async () => {

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id)
  if (!userInfo?.onboarded) redirect('/onboarding');

  const results = await fetchUsers({
    userId: user.id,
    searchString: '',
    pageNumber: 1,
    pageSize: 25,
  })

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>

      {/* Search bar */}

      <div className="mt-14 flex-col flex gap-9">
        {results.users.length === 0 ? (
          <p className="no-result">no users</p>
        ) : (
          <>
            {results.users.map((foundUser) => {
              return (
                <UserCard
                  key={foundUser.id}
                  id={foundUser.id}
                  name={foundUser.name}
                  username={foundUser.username}
                  imgUrl={foundUser.image}
                  foundUserType='User'
                />
              );
            })}
          </>
        )
        }
      </div>
    </section>
  )
}

export default Page