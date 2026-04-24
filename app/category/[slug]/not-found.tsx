import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search } from "lucide-react"

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Category Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>The story category you're looking for doesn't exist or may have been moved.</p>
          </div>

          <div className="space-y-2">
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <div className="text-sm text-muted-foreground">
              <p>Available categories:</p>
              <div className="mt-2 space-y-1">
                <Link href="/category/family-relationships" className="block text-blue-600 hover:underline">
                  Family & Relationships
                </Link>
                <Link href="/category/career-work" className="block text-blue-600 hover:underline">
                  Career & Work
                </Link>
                <Link href="/category/education" className="block text-blue-600 hover:underline">
                  Education
                </Link>
                <Link href="/category/personal-growth" className="block text-blue-600 hover:underline">
                  Personal Growth
                </Link>
                <Link href="/category/community" className="block text-blue-600 hover:underline">
                  Community
                </Link>
                <Link href="/category/overcoming-challenges" className="block text-blue-600 hover:underline">
                  Overcoming Challenges
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
