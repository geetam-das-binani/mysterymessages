import {z }from 'zod'




export const messageSchema = z.object({
    content:z.string()
    .min(10,{message:"content must be alteast 10 characters"})
    .max(1000, {message:"content must be less than 1000 characters"})
 })


 export type MessageSchema = z.infer<typeof messageSchema>