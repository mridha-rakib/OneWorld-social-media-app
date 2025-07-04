import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
// import streamServerClient from "@/lib/stream";
import streamServer from "@/lib/stream-server";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("UploadThing error:", err.message, err.cause);
    return { message: err.message };
  },
});

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const oldAvatarUrl = metadata.user.avatarUrl;

        if (oldAvatarUrl) {
          const key = oldAvatarUrl.split(
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
          )[1];

          await new UTApi().deleteFiles(key);
        }

        const newAvatarUrl = file.url.replace(
          "/f/",
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        );

        await Promise.all([
          prisma.user.update({
            where: { id: metadata.user.id },
            data: {
              avatarUrl: newAvatarUrl,
            },
          }),
          streamServer.partialUpdateUser({
            id: metadata.user.id,
            set: {
              image: newAvatarUrl,
            },
          }),
        ]);

        return { avatarUrl: newAvatarUrl };
      } catch (error) {
        console.error("Avatar upload callback error:", error);
        throw new UploadThingError("Failed to update avatar");
      }
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      try {
        const media = await prisma.media.create({
          data: {
            url: file.url.replace(
              "/f/",
              `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
            ),
            type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
          },
        });

        return { mediaId: media.id };
      } catch (error) {
        console.error("Attachment upload callback error:", error);
        throw new UploadThingError("Failed to create media record");
      }
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
