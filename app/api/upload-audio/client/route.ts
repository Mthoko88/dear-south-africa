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
        // Allow all audio and video content types since browsers vary in how they report audio recordings
        return {
          allowedContentTypes: [
            "audio/*",
            "video/*",
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
        }
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
