import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["audio/webm", "audio/mp3", "audio/mpeg"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            uploadedBy: "voice-recorder",
          }),
        }
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("Upload completed:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 400 }
    )
  }
}
