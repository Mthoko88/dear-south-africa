"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Users, Plus, MessageCircle, Lock, Globe, Crown, Shield, User } from "lucide-react"
import Link from "next/link"

interface SupportCircle {
  id: string
  name: string
  description: string
  category: string
  max_members: number
  is_private: boolean
  created_by: string
  created_at: string
  member_count: number
  user_role?: string
  creator_profile?: {
    username: string
    full_name: string
    avatar_url: string
  }
}

const circleCategories = [
  "Mental Health Support",
  "Single Parents",
  "Job Seekers",
  "Students",
  "Entrepreneurs",
  "Health & Wellness",
  "LGBTQ+ Community",
  "Youth Development",
  "Women's Empowerment",
  "Addiction Recovery",
  "Grief & Loss",
  "Domestic Violence Survivors",
  "Disability Support",
  "Financial Literacy",
  "Skills Development",
  "Community Building",
  "Other",
]

export function SupportCircles() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [circles, setCircles] = useState<SupportCircle[]>([])
  const [myCircles, setMyCircles] = useState<SupportCircle[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"discover" | "my-circles">("discover")

  const [newCircle, setNewCircle] = useState({
    name: "",
    description: "",
    category: "",
    max_members: 20,
    is_private: false,
  })

  useEffect(() => {
    if (user) {
      fetchCircles()
      fetchMyCircles()
    }
  }, [user])

  const fetchCircles = async () => {
    try {
      const { data } = await supabase
        .from("support_circles")
        .select(`
          *,
          circle_members(count),
          profiles:created_by (username, full_name, avatar_url)
        `)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(20)

      if (data) {
        const circlesWithCounts = data.map((circle) => ({
          ...circle,
          member_count: circle.circle_members?.[0]?.count || 0,
          creator_profile: circle.profiles,
        }))
        setCircles(circlesWithCounts)
      }
    } catch (error) {
      console.error("Error fetching circles:", error)
    }
  }

  const fetchMyCircles = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from("circle_members")
        .select(`
          role,
          support_circles (
            *,
            circle_members(count),
            profiles:created_by (username, full_name, avatar_url)
          )
        `)
        .eq("user_id", user.id)

      if (data) {
        const myCirclesData = data.map((item) => ({
          ...item.support_circles,
          member_count: item.support_circles.circle_members?.[0]?.count || 0,
          user_role: item.role,
          creator_profile: item.support_circles.profiles,
        }))
        setMyCircles(myCirclesData)
      }
    } catch (error) {
      console.error("Error fetching my circles:", error)
    }

    setLoading(false)
  }

  const createCircle = async () => {
    if (!user || !newCircle.name.trim() || !newCircle.category) return

    try {
      const { data: circleData, error: circleError } = await supabase
        .from("support_circles")
        .insert({
          name: newCircle.name.trim(),
          description: newCircle.description.trim(),
          category: newCircle.category,
          max_members: newCircle.max_members,
          is_private: newCircle.is_private,
          created_by: user.id,
        })
        .select()
        .single()

      if (circleError) throw circleError

      // Add creator as admin member
      const { error: memberError } = await supabase.from("circle_members").insert({
        circle_id: circleData.id,
        user_id: user.id,
        role: "admin",
      })

      if (memberError) throw memberError

      toast({
        title: "Support circle created!",
        description: `"${circleData.name}" has been created successfully.`,
      })

      setNewCircle({
        name: "",
        description: "",
        category: "",
        max_members: 20,
        is_private: false,
      })
      setCreateDialogOpen(false)
      fetchCircles()
      fetchMyCircles()
    } catch (error) {
      console.error("Error creating circle:", error)
      toast({
        title: "Error",
        description: "Failed to create support circle. Please try again.",
        variant: "destructive",
      })
    }
  }

  const joinCircle = async (circleId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("circle_members").insert({
        circle_id: circleId,
        user_id: user.id,
        role: "member",
      })

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already a member",
            description: "You're already part of this support circle.",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Joined circle!",
          description: "Welcome to the support circle.",
        })
        fetchCircles()
        fetchMyCircles()
      }
    } catch (error) {
      console.error("Error joining circle:", error)
      toast({
        title: "Error",
        description: "Failed to join support circle.",
        variant: "destructive",
      })
    }
  }

  const leaveCircle = async (circleId: string) => {
    if (!user) return

    try {
      await supabase.from("circle_members").delete().eq("circle_id", circleId).eq("user_id", user.id)

      toast({
        title: "Left circle",
        description: "You've left the support circle.",
      })
      fetchCircles()
      fetchMyCircles()
    } catch (error) {
      console.error("Error leaving circle:", error)
      toast({
        title: "Error",
        description: "Failed to leave support circle.",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />
      case "moderator":
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-yellow-600"
      case "moderator":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Support Circles
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Circle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Support Circle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="circle-name">Circle Name</Label>
                  <Input
                    id="circle-name"
                    value={newCircle.name}
                    onChange={(e) => setNewCircle((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Single Moms Support Group"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circle-category">Category</Label>
                  <Select
                    value={newCircle.category}
                    onValueChange={(value) => setNewCircle((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {circleCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circle-description">Description</Label>
                  <Textarea
                    id="circle-description"
                    value={newCircle.description}
                    onChange={(e) => setNewCircle((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="What is this circle about? What kind of support will members provide?"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-members">Maximum Members</Label>
                  <Select
                    value={newCircle.max_members.toString()}
                    onValueChange={(value) =>
                      setNewCircle((prev) => ({ ...prev, max_members: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 members</SelectItem>
                      <SelectItem value="20">20 members</SelectItem>
                      <SelectItem value="50">50 members</SelectItem>
                      <SelectItem value="100">100 members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-private"
                    checked={newCircle.is_private}
                    onChange={(e) => setNewCircle((prev) => ({ ...prev, is_private: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is-private" className="text-sm">
                    Make this circle private (invite-only)
                  </Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createCircle} disabled={!newCircle.name.trim() || !newCircle.category}>
                    Create Circle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === "discover" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("discover")}
            className="flex-1"
          >
            <Globe className="h-4 w-4 mr-2" />
            Discover
          </Button>
          <Button
            variant={activeTab === "my-circles" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("my-circles")}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            My Circles ({myCircles.length})
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "discover" && (
              <>
                {circles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No support circles yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to create a support circle for your community.
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Circle
                    </Button>
                  </div>
                ) : (
                  circles.map((circle) => {
                    const isJoined = myCircles.some((mc) => mc.id === circle.id)

                    return (
                      <Card
                        key={circle.id}
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          if (isJoined) {
                            window.location.href = `/circles/${circle.id}`
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{circle.name}</h4>
                              {circle.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
                              <Badge variant="outline" className="text-xs">
                                {circle.category}
                              </Badge>
                            </div>

                            {circle.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{circle.description}</p>
                            )}

                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {circle.member_count}/{circle.max_members} members
                              </div>
                              <div className="flex items-center">
                                <Avatar className="h-4 w-4 mr-1">
                                  <AvatarImage src={circle.creator_profile?.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">
                                    {circle.creator_profile?.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                Created by {circle.creator_profile?.username}
                              </div>
                              <span>Created {new Date(circle.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {isJoined ? (
                              <>
                                <Button size="sm" asChild>
                                  <Link href={`/circles/${circle.id}`}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => leaveCircle(circle.id)}>
                                  Leave
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => joinCircle(circle.id)}
                                disabled={circle.member_count >= circle.max_members}
                              >
                                {circle.member_count >= circle.max_members ? "Full" : "Join"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })
                )}
              </>
            )}

            {activeTab === "my-circles" && (
              <>
                {myCircles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">You haven't joined any circles yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Join support circles to connect with others who share similar experiences.
                    </p>
                    <Button onClick={() => setActiveTab("discover")}>Discover Circles</Button>
                  </div>
                ) : (
                  myCircles.map((circle) => (
                    <Card
                      key={circle.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => (window.location.href = `/circles/${circle.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{circle.name}</h4>
                            {circle.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
                            <Badge variant="outline" className="text-xs">
                              {circle.category}
                            </Badge>
                            {circle.user_role && (
                              <Badge variant="secondary" className={`text-xs ${getRoleColor(circle.user_role)}`}>
                                {getRoleIcon(circle.user_role)}
                                <span className="ml-1 capitalize">{circle.user_role}</span>
                              </Badge>
                            )}
                          </div>

                          {circle.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{circle.description}</p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {circle.member_count}/{circle.max_members} members
                            </div>
                            <span>Joined {new Date(circle.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" asChild>
                            <Link href={`/circles/${circle.id}`}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Open
                            </Link>
                          </Button>
                          {circle.user_role !== "admin" && (
                            <Button variant="outline" size="sm" onClick={() => leaveCircle(circle.id)}>
                              Leave
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
