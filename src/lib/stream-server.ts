import { StreamChat } from "stream-chat";

export const streamServer = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!,
  process.env.STREAM_SECRET!,
);

export default streamServer;
