import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, BookOpen, Lightbulb, Home, TrendingUp } from "lucide-react"

const categories = [
  { name: "Family & Relationships", icon: Heart, count: 234, color: "bg-red-100 text-red-800" },
  { name: "Career & Work", icon: Users, count: 189, color: "bg-blue-100 text-blue-800" },
  { name: "Education", icon: BookOpen, count: 156, color: "bg-green-100 text-green-800" },
  { name: "Personal Growth", icon: Lightbulb, count: 203, color: "bg-yellow-100 text-yellow-800" },
  { name: "Community", icon: Home, count: 167, color: "bg-purple-100 text-purple-800" },
  { name: "Overcoming Challenges", icon: TrendingUp, count: 298, color: "bg-orange-100 text-orange-800" },
]

export function Sidebar() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Story Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Button key={category.name} variant="ghost" className="w-full justify-start h-auto p-3">
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.count} stories</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Share your authentic experiences</p>
          <p>• Respect others' stories and perspectives</p>
          <p>• Use appropriate content warnings</p>
          <p>• Support and encourage fellow community members</p>
          <Button variant="outline" size="sm" className="w-full mt-3">
            Read Full Guidelines
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Stories</span>
            <span className="text-sm font-medium">1,247</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Active Members</span>
            <span className="text-sm font-medium">8,934</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Stories This Week</span>
            <span className="text-sm font-medium">89</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
