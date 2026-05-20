import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

// Allow larger body sizes for long audio recordings (up to 500MB)
export const maxDuration = 300 // 5 minute function timeout
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("audio") as File

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Check file size (limit to 500MB for very long recordings)
    const MAX_SIZE = 500 * 1024 * 1024 // 500MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 500MB." },
        { status: 413 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      contentType: file.type,
    })

    return NextResponse.json({
      url: blob.url,
      success: true,
    })
  } catch (error) {
    console.error("Error uploading audio:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("too large") || error.message.includes("size")) {
        return NextResponse.json(
          { error: "File too large for upload" },
          { status: 413 }
        )
      }
    }
    
    return NextResponse.json({ error: "Failed to upload audio" }, { status: 500 })
  }
}
