import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params

    const body = await request.json()

    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from("stories")
      .update({
        title: body.title,
        content: body.content,
        audio_url: body.audio_url,
        category: body.category,
        content_warning: body.content_warning,
        location: body.location,
        is_anonymous: body.is_anonymous,
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId)
      .select()
      .single()

    if (error) {
      console.error("Error updating story:", error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("PATCH story error:", error)

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
