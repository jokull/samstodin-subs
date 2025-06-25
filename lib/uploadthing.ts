import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "./session";

const f = createUploadthing();

export const ourFileRouter = {
  // Admin-only OpenGraph image uploader
  opengraphUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await getSession(req.cookies.get("__session")?.value ?? "");

      if (!user?.isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      return { userId: user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
