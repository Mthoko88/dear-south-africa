"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, MessageCircle, Heart, Reply, CheckCheck, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { BackButton } from "@/components/back-button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

function getNotificationIcon(type: string) {
  switch (type) {
    case "comment":
      return <MessageCircle className="h-5 w-5 text-blue-500" />
    case "reaction":
      return <Heart className="h-5 w-5 text-red-500" />
    case "reply":
      return <Reply className="h-5 w-5 text-green-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString("en-ZA", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    } else if (user) {
      fetchNotifications()
    }
  }, [user, authLoading, router])

  const fetchNotifications = async () => {
    if (!user || !supabase) return
    setLoading(true)

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setNotifications(data)
    }
    setLoading(false)
  }

  const markAsRead = async (notificationId: string) => {
    if (!supabase) return

    await supabase.from("notifications").update({ read: true }).eq("id", notificationId)
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = async () => {
    if (!user || !supabase) return

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)
    
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    toast({
      title: "All caught up!",
      description: "All notifications marked as read.",
    })
  }

  const deleteNotification = async (notificationId: string) => {
    if (!supabase) return

    await supabase.from("notifications").delete().eq("id", notificationId)
    setNotifications(notifications.filter(n => n.id !== notificationId))
  }

  const deleteAllRead = async () => {
    if (!user || !supabase) return

    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("read", true)
    
    setNotifications(notifications.filter(n => !n.read))
    toast({
      title: "Cleaned up!",
      description: "All read notifications have been deleted.",
    })
  }

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id)
    
    if (notification.related_id) {
      router.push(`/story/${notification.related_id}`)
    }
  }

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-4">
          <BackButton />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} unread</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                >
                  Unread
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Action buttons */}
            {notifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all as read
                  </Button>
                )}
                {notifications.some(n => n.read) && (
                  <Button variant="outline" size="sm" onClick={deleteAllRead}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete read
                  </Button>
                )}
              </div>
            )}

            {/* Notifications list */}
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {filter === "unread" 
                    ? "You're all caught up! Check back later for new activity."
                    : "When someone comments on or reacts to your stories, you'll see it here."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-primary/5 border border-primary/10" : "border border-transparent"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
