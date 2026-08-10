"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, User, LogOut, Settings, BookOpen, Users, TrendingUp, Menu, Mail, Shield, ShieldAlert, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { MobileSidebar } from "@/components/mobile-sidebar"

export function Header() {
  const { user, profile, signOut } = useAuth()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signup")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const openAuthModal = (tab: "signin" | "signup") => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleProfileClick = () => {
    if (profile?.username) {
      router.push(`/profile/${profile.username}`)
    } else {
      router.push("/profile/edit")
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left logo / mobile menu */}
            <div className="flex items-center space-x-2">
              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-red-600 px-3 rounded-md mr-2">
                  <div className="text-white font-bold text-sm leading-tighter">
                    <div>Dear</div>
                    <div className="text-2xl">SA</div>
                  </div>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xl font-bold text-foreground">Dear South Africa</span>
                  <span className="text-xs text-muted-foreground">Share. Connect. Heal.</span>
                </div>
              </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md md:mx-4" role="search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories, categories..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {user && (
                <Link href="/connections" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Connect</span>
                  </Button>
                </Link>
              )}

              {user ? (
                <>
                  <NotificationDropdown />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuItem onClick={handleProfileClick} className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {profile?.username ? "View Profile" : "Setup Profile"}
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/profile/edit" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/connections" className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Find Connections
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/bookmarks" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Bookmarks
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/register/organisation" className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          Register Organisation
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href="/contact" className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Us
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/privacy" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Privacy Policy
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/child-safety" className="flex items-center">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Child Safety Standards
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/admin/moderation" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Moderation
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={signOut} className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 sm:px-3"
                    onClick={() => openAuthModal("signin")}
                  >
                    Sign In
                  </Button>
                  <Button size="sm" className="px-2 sm:px-3" onClick={() => openAuthModal("signup")}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authModalTab} />
    </>
  )
}
