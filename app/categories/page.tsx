import type { Metadata } from "next"
import { CategoriesPage } from "@/components/categories-page"

export const metadata: Metadata = {
  title: "All Categories - Dear South Africa",
  description: "Browse all story categories and suggest new ones for the Dear South Africa community.",
}

export default function Categories() {
  return <CategoriesPage />
}
