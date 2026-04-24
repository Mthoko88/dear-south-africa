import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filenameParam = searchParams.get("filename")
    
    // Check content type to determine how to handle the request
    const contentType = request.headers.get("content-type") || ""
    
    let file: Blob
    let filename: string
    
    if (contentType.includes("multipart/form-data")) {
      // Handle FormData uploads (from MediaUpload component)
      const formData = await request.formData()
      const uploadedFile = formData.get("file") as File | null
      
      if (!uploadedFile) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }
      
      file = uploadedFile
      filename = `uploads/${Date.now()}-${uploadedFile.name}`
    } else {
      // Handle raw blob uploads (legacy method)
      if (!filenameParam) {
        return NextResponse.json({ error: "Filename is required" }, { status: 400 })
      }
      
      file = await request.blob()
      filename = filenameParam
    }

    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading to blob:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
