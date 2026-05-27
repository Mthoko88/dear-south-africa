import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("[v0] Category suggest auth error:", authError)
      return NextResponse.json({ error: "You must be logged in to suggest a category" }, { status: 401 })
    }
    
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    // Create a slug from the name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if category already exists
    const { data: existing } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 })
    }

    // Insert the new category
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description,
        story_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating category:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, category: data })
  } catch (error) {
    console.error("[v0] Category suggestion error:", error)
    return NextResponse.json({ error: "Failed to create category suggestion" }, { status: 500 })
  }
}
