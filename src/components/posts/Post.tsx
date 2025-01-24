import { Post as postData } from "@prisma/client";

interface PostProps {
  post: postData;
}

export default function Post({ post }: PostProps) {
  return <article>{post.content}</article>;
}
