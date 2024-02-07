"use client"
import Link from "next/link"
import Image from "next/image"


const ThreadLink = ({ userProfileId, userImage }) => {
  return (
    <Link href={`/profile/${userProfileId}`} className='relative h-11 w-11 overflow-hidden'>
                  <Image
                    src={userImage}
                    alt='user_community_image'
                    fill
                    className='cursor-pointer rounded-full'
                  />
    </Link>
  )
}

export default ThreadLink