import {z} from 'zod'
export  const AcceptMessageSchema = z.object({
    acceptMessages: z.boolean()
})

export type AcceptMessage = z.infer<typeof AcceptMessageSchema>