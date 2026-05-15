import { CategoryStoryFeed } from "@/components/category-story-feed"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { supabase } from "@/lib/supabase/client"
import { notFound } from "next/navigation"

const PREDEFINED_CATEGORIES: Record<string, { name: string; description: string }> = {
  "mental-health": {
    name: "Mental Health",
    description: "Stories about mental health journeys, challenges, and healing.",
  },
  relationships: {
    name: "Relationships",
    description: "Stories about love, family bonds, and relationships.",
  },
  career: {
    name: "Career & Work",
    description: "Experiences from the workplace and professional life.",
  },
  education: {
    name: "Education",
    description: "Journeys of learning and personal development.",
  },
  "personal-growth": {
    name: "Personal Growth",
    description: "Self-improvement, wellness, and finding purpose.",
  },
  family: {
    name: "Family",
    description: "Stories about family life, parenting, and family relationships.",
  },
  community: {
    name: "Community",
    description: "How we come together to build a better society.",
  },
}

async function fetchCategory(slug: string) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("slug, name, description")
      .eq("slug", slug)
      .maybeSingle()

    if (error || !data) {
      return PREDEFINED_CATEGORIES[slug] ? { ...PREDEFINED_CATEGORIES[slug], slug } : null
    }

    return data
  } catch (error) {
    console.error("Error fetching category:", error)
    return PREDEFINED_CATEGORIES[slug] ? { ...PREDEFINED_CATEGORIES[slug], slug } : null
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await fetchCategory(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Sidebar />
          </aside>
          <main className="lg:col-span-3">
            <CategoryStoryFeed
              category={params.slug}
              categoryDisplayName={category.name}
              categoryDescription={category.description}
            />
          </main>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await fetchCategory(params.slug)

  if (!category) {
    return { title: "Category Not Found" }
  }

  return {
    title: `${category.name} Stories - Dear South Africa`,
    description: category.description,
  }
}
