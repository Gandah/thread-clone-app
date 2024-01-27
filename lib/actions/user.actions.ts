"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model"
import { connectTODB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
  }

interface UserInfo {
    _id: string;   
    onboarded: boolean;
    id: string;
    image: string;  
    name: string;
    username: string;
    bio: string;
    threads: [];
  }

interface fetchUsersParams {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}

  //Create/ update user details
export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
    connectTODB();

    try
    {
        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            {upsert: true}
        );
    
        if(path === '/profile/edit'){
            revalidatePath(path);
        }
    }catch(error: any){
        throw new Error(`User update failed: ${error.message}`);
    }
}

// fetch user details
export async function fetchUser(
    userId: string): Promise<UserInfo | null>{

    try
    {
        connectTODB();
        return await User.findOne({id: userId})
        // .populate({
        //     path: 'communities',
        //     model: Community
        // })
    }catch(error: any){
        throw new Error(`User fetch failed: ${error.message}`);
    }
}

// Retrieve User posts
export async function fetchUserPosts(userId: string){

    try {
        connectTODB();

        //TODO: populate communities
        const threads = await User.findOne({ id: userId })
        .populate({
            path: 'threads',
            model: Thread,
            populate: {
                path: 'children',
                model: Thread,
                populate:{
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
                
            }
        })

        return threads
    }catch(error: any){
        throw new Error(`Failed to fetch posts ${error.message}`)
    }
}

//Retrieves all users 
export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"

} : fetchUsersParams
){

    try {
        connectTODB();

        const skipAmount = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString, "i");

        //filter out the current user 
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        //if search not equal to empty string, query the database by
        //by username or name
        if(searchString.trim() !== ''){
            query.$or = [
                { username: { $regex: regex}},
                { name: { $regex: regex}}
            ]
        }

        const sortOptions = { createdAt: sortBy}

        const getAllUsersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);
        const users = await getAllUsersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users,  isNext};
    }catch(error: any){
        throw new Error(`Failed to fetch users ${error.message}`)
    }
}

//Retrieves user activity
export async function getActivity(userId: string){
    try {
        connectTODB();

        //find threads created by the user
        const userThreads = await Thread.find({ author: userId });

        

        //collect and merge all child thread ids into an array
        const childThreadIds: string[] = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, [])

        // console.log("ids:", childThreadIds)

        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId } //exclude threads authored by same user
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies;

    }catch(error: any){

        throw new Error(`Failed to fetch user activity: ${error.message}`)
    }
}