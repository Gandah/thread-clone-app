"use server"

import { connectTODB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { revalidatePath } from "next/cache";




interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

//creates posts and attaches them to the user 
export async function createThread({
    text,
    author,
    communityId,
    path,
}: Params){

    try {
        connectTODB();
    
        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });
    
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })
    
        revalidatePath(path);
    }catch(error: any){
        throw new Error(`Error creating thread: ${error.message}`);
    };
}

//fetches posts and implements pagination
export async function fetchPosts(pageNumber = 1, pageSize = 20) {
     
     connectTODB();

    try {
       
        // Calculate the number of posts to skip
        const skipAmount = (pageNumber - 1) * pageSize;

        // Use Promise.all to execute both queries in parallel
        const [posts, totalPostsCount] = await Promise.all([
            // Fetch the posts
            Thread.find({ parentId: { $in: [null, undefined] } })
                .sort({ createdAt: 'desc' })
                .skip(skipAmount)
                .limit(pageSize)
                .populate({ path: 'author', model: User, select: '_id name image' })
                // .populate({ path: "community", model: Community })
                .populate({
                    path: 'children',
                    populate: { path: 'author', model: User, select: '_id name parentId image' }
                })
                .exec(),

            // Get the total count of posts
            Thread.countDocuments({ parentId: { $in: [null, undefined] } })
        ]);

        // Checks for more posts in order to render another page
        const isNext = totalPostsCount > skipAmount + posts.length;

        return { posts, isNext };
    } catch (error) {
        console.error("Error fetching posts:", error);
        // Handle the error as per your application's error handling policy
        // This could be returning an error message, throwing a custom error, etc.
        throw error; // Rethrow the error if you want the caller to handle it
    }
}


//Retrieves a post with its details
export async function fetchThreadById(id: string) {
    connectTODB();

    try {
        //TODO: Populate community
        const thread = await Thread.findById(id)
        .populate({
                path: 'author', // Populate the author field within children
                model: User, 
                select: "_id id name image",        
        })
        .populate({
            path: 'children',
            populate: [{
                path: 'author', // Populate the author field within children
                model: User, 
                select: '_id id name parentId image',   
            },
            {
                path: 'children',
                model:Thread, 
                populate: {
                    path: 'author', 
                    model: User,
                    select: '_id id name parentId image',
                }
            }
        ]
               
        }).exec();

        return thread;
    }catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`);
    }
}

//Add comments to thread
export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
){
    connectTODB();

    try {
        //find thread by its ID
        const originalThread = await Thread.findById(threadId)

        if(!originalThread){
            throw new Error("Thread not found")
        }

        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId
        })

        //Save the comment
        const savedCommentThread = await commentThread.save()

        //Update the original thread to include the saved comment
        originalThread.children.push(savedCommentThread._id)

        //Save the original thread with new saved comment
        await originalThread.save();

        revalidatePath(path);
    }catch (error: any) {
        throw new Error(`Error adding comment to thread: ${error.message}`);
    }
}
