import { createClient } from "@supabase/supabase-js"

// Your Supabase credentials
const supabaseUrl = "https://aviwsgsymuvdhjmhizaq.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aXdzZ3N5bXV2ZGhqbWhpemFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzEwMjksImV4cCI6MjA2NTY0NzAyOX0.GReyqZw-D7crcEktNhRDnwu9xk1k24jZeRlSHhw3qF4"

// Create a singleton instance to avoid multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: "dear-sa-auth-token", // Use a unique storage key
      },
    })
  }
  return supabaseInstance
})()

// Mock data for initial seeding (we'll use this to populate the database)
export const mockStories = [
  {
    id: "1",
    title: "From Khayelitsha to UCT: My Journey Through Education",
    content:
      "Growing up in Khayelitsha, I never thought university was possible. My mother worked three jobs to keep us afloat, and books were a luxury we couldn't afford. But my Grade 7 teacher, Mrs. Ndaba, saw something in me that I couldn't see in myself. She stayed after school to help me with my homework, brought me books from her own collection, and constantly reminded me that education was my ticket to a better life.\n\nThe road wasn't easy. I had to wake up at 4 AM to study before helping my mother with household chores. I walked 5 kilometers to school every day because we couldn't afford taxi fare. But every small victory - every good grade, every teacher's encouragement - fueled my determination.\n\nWhen I received my matric results and qualified for university, I cried for hours. Not just from joy, but from the overwhelming realization that dreams really can come true. Today, I'm in my final year at UCT studying medicine, and I volunteer at schools in Khayelitsha, hoping to be that teacher for another child who needs to believe in themselves.",
    author_id: "user1",
    category: "Education",
    content_warnings: [],
    location: "Cape Town, Western Cape",
    upvotes: 234,
    downvotes: 3,
    view_count: 1250,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    profiles: {
      username: "thabo_m",
      full_name: "Thabo Mthembu",
      avatar_url: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "2",
    title: "Losing My Job During COVID and Finding My Purpose",
    content:
      "March 2020 changed everything. I was a manager at a restaurant in Sandton when lockdown hit. Suddenly, I was unemployed with two kids to feed and rent to pay. The first few weeks were the darkest of my life. I felt like I had failed my family.\n\nBut then I remembered my grandmother's recipes - the ones she used to make for the whole neighborhood during tough times. I started cooking from home, selling meals to neighbors who were also struggling. What began as desperation slowly turned into something beautiful.\n\nMy small kitchen became a lifeline for our community. People didn't just come for the food; they came for connection, for a sense of normalcy in an uncertain world. I realized that feeding people wasn't just about the food - it was about nourishing souls.\n\nToday, I run a successful catering business from my home. I employ three other women from my neighborhood who also lost their jobs during the pandemic. We've turned our pain into purpose, and our community is stronger because of it.",
    author_id: "user2",
    category: "Career & Work",
    content_warnings: ["Financial Hardship"],
    location: "Johannesburg, Gauteng",
    upvotes: 189,
    downvotes: 1,
    view_count: 890,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    profiles: {
      username: "nomsa_k",
      full_name: "Nomsa Khumalo",
      avatar_url: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "3",
    title: "Coming Out in a Traditional Zulu Family",
    content:
      "I was 22 when I finally found the courage to tell my family who I really was. Growing up in rural KwaZulu-Natal, being gay wasn't something we talked about. I spent years hiding, pretending, and slowly dying inside.\n\nThe night I told my parents, I was prepared for the worst. I had packed a bag and was ready to leave home forever. My father's initial silence felt like an eternity. But then he did something I never expected - he asked me if I was happy.\n\nIt wasn't immediate acceptance. There were difficult conversations, tears, and moments of tension. But my family chose love over tradition, understanding over judgment. My mother now proudly introduces my partner at family gatherings, and my father has become an unexpected advocate for LGBTQ+ rights in our community.\n\nThis experience taught me that sometimes the people we think will reject us are the ones who surprise us the most. It also showed me the power of living authentically - not just for ourselves, but for others who are still hiding in the shadows.",
    author_id: "user3",
    category: "Family & Relationships",
    content_warnings: ["Discrimination"],
    location: "Durban, KwaZulu-Natal",
    upvotes: 456,
    downvotes: 12,
    view_count: 2100,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      username: "sipho_d",
      full_name: "Sipho Dlamini",
      avatar_url: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "4",
    title: "Building a Community Garden in Alexandra",
    content:
      "Our neighborhood had no fresh vegetables, just spaza shops selling processed food at inflated prices. My children were getting sick frequently, and I knew their diet was part of the problem. That's when I decided to do something about it.\n\nI convinced five neighbors to join me in converting an empty lot into a community garden. The landlord was skeptical but agreed to let us try for six months. We pooled our resources - R50 each - and bought seeds, basic tools, and some compost.\n\nThe first few months were challenging. Some plants died, others were stolen, and people laughed at our 'small patch of hope.' But slowly, things began to grow - not just the vegetables, but our community spirit.\n\nToday, our garden feeds over 30 families. We've expanded to three lots, and we're teaching children about nutrition and farming. What started as a desperate attempt to feed our families has become a symbol of what we can achieve when we work together. We've proven that even in the most challenging circumstances, we can create abundance.",
    author_id: "user4",
    category: "Community",
    content_warnings: [],
    location: "Alexandra, Gauteng",
    upvotes: 312,
    downvotes: 5,
    view_count: 1450,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      username: "grace_m",
      full_name: "Grace Mabaso",
      avatar_url: "/placeholder.svg?height=40&width=40",
    },
  },
]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          location: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category: string
          content_warnings: string[]
          location: string | null
          upvotes: number
          downvotes: number
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          content: string
          author_id: string
          category: string
          content_warnings?: string[]
          location?: string | null
        }
        Update: {
          title?: string
          content?: string
          category?: string
          content_warnings?: string[]
          location?: string | null
          updated_at?: string
        }
      }
    }
  }
}
