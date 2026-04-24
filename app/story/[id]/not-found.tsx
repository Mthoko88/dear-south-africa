import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FileX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Story Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The story you're looking for doesn't exist or may have been removed.
            </p>
            <div className="space-y-2">
              <Link href="/" className="block">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Stories
                </Button>
              </Link>
              <Link href="/categories" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
