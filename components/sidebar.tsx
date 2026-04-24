"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Users, TrendingUp, Heart, Settings, User, Bookmark, Calendar, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile } = useAuth()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="hidden md:flex w-64 flex-col h-screen bg-background border-r sticky top-16">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Navigation */}
        <nav className="space-y-2">
          <Link href="/">
            <Button variant={isActive("/") ? "secondary" : "ghost"} className="w-full justify-start">
              <Home className="mr-3 h-4 w-4" />
              Home
            </Button>
          </Link>

          <Link href="/categories">
            <Button variant={isActive("/categories") ? "secondary" : "ghost"} className="w-full justify-start">
              <BookOpen className="mr-3 h-4 w-4" />
              Categories
            </Button>
          </Link>

          {user && (
            <>
              <Link href="/dashboard">
                <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} className="w-full justify-start">
                  <TrendingUp className="mr-3 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <Link href="/connections">
                <Button variant={isActive("/connections") ? "secondary" : "ghost"} className="w-full justify-start">
                  <Users className="mr-3 h-4 w-4" />
                  Connections
                </Button>
              </Link>

              <Link href="/bookmarks">
                <Button variant={isActive("/bookmarks") ? "secondary" : "ghost"} className="w-full justify-start">
                  <Bookmark className="mr-3 h-4 w-4" />
                  Bookmarks
                </Button>
              </Link>

              <Link href="/diary">
                <Button variant={isActive("/diary") ? "secondary" : "ghost"} className="w-full justify-start">
                  <Calendar className="mr-3 h-4 w-4" />
                  My Diary
                </Button>
              </Link>
            </>
          )}
        </nav>

        <Separator />

        {/* User Section */}
        {user && profile && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2">Profile</h3>
            {profile?.username ? (
              <Link href={`/profile/${profile.username}`}>
                <Button
                  variant={isActive(`/profile/${profile.username}`) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <User className="mr-3 h-4 w-4" />
                  My Profile
                </Button>
              </Link>
            ) : (
              <Button disabled className="w-full justify-start opacity-50">
                <User className="mr-3 h-4 w-4" />
                My Profile
              </Button>
            )}

            <Link href="/profile/edit">
              <Button variant={isActive("/profile/edit") ? "secondary" : "ghost"} className="w-full justify-start">
                <Settings className="mr-3 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        )}

        <Separator />

        {/* Community Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-2">Community</h3>

          <Link href="/community">
            <Button variant={isActive("/community") ? "secondary" : "ghost"} className="w-full justify-start">
              <Heart className="mr-3 h-4 w-4" />
              Community Hub
            </Button>
          </Link>

          <Link href="/support">
            <Button variant={isActive("/support") ? "secondary" : "ghost"} className="w-full justify-start">
              <HelpCircle className="mr-3 h-4 w-4" />
              Support & Resources
            </Button>
          </Link>
        </div>

        {/* Popular Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Popular Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/category/mental-health" className="block">
              <Badge variant="secondary" className="w-full justify-center py-1">
                Mental Health
              </Badge>
            </Link>
            <Link href="/category/relationships" className="block">
              <Badge variant="secondary" className="w-full justify-center py-1">
                Relationships
              </Badge>
            </Link>
            <Link href="/category/career" className="block">
              <Badge variant="secondary" className="w-full justify-center py-1">
                Career
              </Badge>
            </Link>
            <Link href="/category/family" className="block">
              <Badge variant="secondary" className="w-full justify-center py-1">
                Family
              </Badge>
            </Link>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
