"use client"

import Link from "next/link"
import Image from "next/image"
import { Home, BookOpen, Users, TrendingUp, Heart, Settings, User, Bookmark, Calendar, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MobileSidebarProps {
  onClose: () => void
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const { user, profile, signOut } = useAuth()

  const handleLinkClick = () => {
    onClose()
  }

  const handleSignOut = () => {
    signOut()
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Image
            src="/dear-sa-logo.png"
            alt="Dear South Africa logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-md"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm">Dear South Africa</span>
            <span className="text-xs text-muted-foreground">Share. Connect. Heal.</span>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      {user && profile && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{profile.full_name || profile.username}</p>
              <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          <Link href="/" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-3 h-4 w-4" />
              Home
            </Button>
          </Link>

          <Link href="/categories" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <BookOpen className="mr-3 h-4 w-4" />
              Categories
            </Button>
          </Link>

          {user && (
            <>
              <Link href="/dashboard" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="mr-3 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <Link href="/connections" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-3 h-4 w-4" />
                  Connections
                </Button>
              </Link>

              <Link href="/bookmarks" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <Bookmark className="mr-3 h-4 w-4" />
                  Bookmarks
                </Button>
              </Link>

              <Link href="/diary" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="mr-3 h-4 w-4" />
                  My Diary
                </Button>
              </Link>

              <Separator className="my-2" />

              {profile?.username ? (
                <Link href={`/profile/${profile.username}`} onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start">
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

              <Link href="/profile/edit" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-3 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </>
          )}

          <Separator className="my-2" />

          <Link href="/community" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Heart className="mr-3 h-4 w-4" />
              Community
            </Button>
          </Link>

          <Link href="/support" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="mr-3 h-4 w-4" />
              Support
            </Button>
          </Link>
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        {user ? (
          <Button onClick={handleSignOut} variant="outline" className="w-full bg-transparent">
            Sign Out
          </Button>
        ) : (
          <Button onClick={handleLinkClick} className="w-full">
            Sign In
          </Button>
        )}
      </div>
    </div>
  )
}
