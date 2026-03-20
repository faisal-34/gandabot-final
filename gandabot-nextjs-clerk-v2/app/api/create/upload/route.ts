import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Max 50MB for video, 10MB for audio
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/ogg"];
const ALLOWED_AUDIO = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/webm", "audio/mp4"];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const videoFile = formData.get("video") as File | null;
  const audioFile = formData.get("audio") as File | null;

  if (!videoFile) return NextResponse.json({ error: "No video file provided" }, { status: 400 });

  // Validate video type
  if (!ALLOWED_VIDEO.includes(videoFile.type)) {
    return NextResponse.json({ error: `Unsupported video type: ${videoFile.type}` }, { status: 400 });
  }
  if (videoFile.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: "Video file exceeds 50MB limit" }, { status: 400 });
  }

  // Convert video to base64 data URL — preserves ALL tracks including audio
  const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
  const videoUrl = `data:${videoFile.type};base64,${videoBuffer.toString("base64")}`;

  let audioUrl: string | null = null;

  if (audioFile && audioFile.size > 0) {
    if (!ALLOWED_AUDIO.includes(audioFile.type)) {
      return NextResponse.json({ error: `Unsupported audio type: ${audioFile.type}` }, { status: 400 });
    }
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio file exceeds 10MB limit" }, { status: 400 });
    }
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    audioUrl = `data:${audioFile.type};base64,${audioBuffer.toString("base64")}`;
  }

  return NextResponse.json({
    success: true,
    videoUrl,
    audioUrl,
    videoType: videoFile.type,
    videoSize: videoFile.size,
    hasAudio: !!audioUrl,
  });
}
