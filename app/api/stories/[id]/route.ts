import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const storyId = params.id

    // Get the authenticated user from the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the story
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error in PATCH /api/stories/[id]:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
