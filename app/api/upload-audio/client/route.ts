import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Authenticate user here if needed
        return {
          allowedContentTypes: ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/wav"],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Audio upload completed:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("Error handling upload:", error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
