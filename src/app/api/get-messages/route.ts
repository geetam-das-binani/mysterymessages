import { getServerSession,User  } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized Access",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user._id;
    // const userss=await  UserModel.aggregate([
    //     {match:{
    //         id:userId
    //     }},
    //     {
    //         $unwind:{
    //             "$messages"
    //         }
    //     },{
    //         $sort:{
    //             "messages.createdAt":-1
    //         }
    //     },{
    //         $group:{
    //             _id:"$_id",
    //             messages:{
    //                 $push:"$messages"
    //             }
    //         }
    //     }
    // ])
    const userWithMessages = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    if (!userWithMessages) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const messages = userWithMessages.messages;

    return NextResponse.json(
      {
        success: true,
        messages,
      },
      { status: 200 }
    );
  } catch (error:any) {
    console.log("Internal Server Error",error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
