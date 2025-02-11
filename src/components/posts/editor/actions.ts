"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: { content: string }) {
  const { user } = await validateRequest();

  if (!user)
    throw new Error(
      "Unauthorized access: You must be logged in to submit a post.",
    );

  const { content } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
