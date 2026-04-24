import { Card, CardContent } from "@/components/ui/card"

export default function BookmarksLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="h-10 bg-muted rounded flex-1 animate-pulse"></div>
        <div className="h-10 bg-muted rounded w-full sm:w-48 animate-pulse"></div>
        <div className="h-10 bg-muted rounded w-full sm:w-48 animate-pulse"></div>
      </div>

      {/* Stories grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-muted rounded mb-4"></div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
