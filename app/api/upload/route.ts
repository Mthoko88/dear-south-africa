import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const file = formData.get("audio") as File

    if (!file) {
      return NextResponse.json(
        { error: "No audio file uploaded" },
        { status: 400 },
      )
    }

    console.log("Uploading file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Force correct audio content type
    const blob = await put(file.name, file, {
      access: "public",
      contentType: "audio/webm",
    })

    console.log("Upload successful:", blob.url)

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error("UPLOAD ERROR:", error)

    return NextResponse.json(
      {
        error: "Failed to upload audio",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
