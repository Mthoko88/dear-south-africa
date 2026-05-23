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
          // Explicitly list all allowed content types (wildcards not supported)
          allowedContentTypes: [
            "audio/webm",
            "audio/mp4",
            "audio/ogg",
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/aac",
            "video/webm",  // Chrome often records audio as video/webm
            "video/mp4",
            "video/ogg",
            "application/octet-stream", // Fallback for unknown types
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
        }
      },
      // Remove onUploadCompleted as it requires webhook configuration
      // and can cause the upload to hang waiting for callback
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
