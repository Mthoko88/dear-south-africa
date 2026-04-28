import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()

    console.log("[v0] Processing file:", fileName, "Type:", fileType)

    // Handle text files
    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      const text = await file.text()
      return NextResponse.json({ text })
    }

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        const pdfParse = (await import("pdf-parse")).default
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log("[v0] Extracting PDF, buffer size:", buffer.length)
        const data = await pdfParse(buffer)

        return NextResponse.json({ text: data.text })
      } catch (error) {
        console.error("PDF extraction error:", error)
        return NextResponse.json(
          {
            error: "Could not extract text from PDF. Please try copying and pasting the text instead.",
          },
          { status: 400 },
        )
      }
    }

    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      try {
        const mammoth = await import("mammoth")
        const arrayBuffer = await file.arrayBuffer()

        console.log("[v0] Extracting DOCX, buffer size:", arrayBuffer.byteLength)
        const result = await mammoth.extractRawText({ arrayBuffer })

        console.log("[v0] DOCX extraction successful, text length:", result.value.length)
        return NextResponse.json({ text: result.value })
      } catch (error) {
        console.error("DOCX extraction error:", error)
        return NextResponse.json(
          {
            error: "Could not extract text from Word document. Please try copying and pasting the text instead.",
          },
          { status: 400 },
        )
      }
    }

    if (fileType === "application/msword" || fileName.endsWith(".doc")) {
      return NextResponse.json(
        {
          error: "Older .doc files are not supported. Please save as .docx or copy and paste your story.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
  } catch (error) {
    console.error("Error extracting text:", error)
    return NextResponse.json({ error: "Failed to extract text from document" }, { status: 500 })
  }
}
