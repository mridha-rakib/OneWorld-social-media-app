"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function submitPost(input: { content: string }) {
  const { user } = await validateRequest();

  if (!user)
    throw new Error(
      "Unauthorized access: You must be logged in to submit a post.",
    );

  const { content } = createPostSchema.parse(input);

  await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
  });

  revalidatePath("/");
}
