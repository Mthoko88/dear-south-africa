"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Palette, Save, Settings, User, Heart, Shield, Globe } from "lucide-react"

const themes = [
  { id: "default", name: "Default", primary: "#3b82f6", secondary: "#64748b" },
  { id: "warm", name: "Warm", primary: "#f59e0b", secondary: "#78716c" },
  { id: "cool", name: "Cool", primary: "#06b6d4", secondary: "#475569" },
  { id: "nature", name: "Nature", primary: "#10b981", secondary: "#6b7280" },
  { id: "sunset", name: "Sunset", primary: "#f97316", secondary: "#a3a3a3" },
  { id: "ocean", name: "Ocean", primary: "#0ea5e9", secondary: "#64748b" },
]

const profileSections = [
  { id: "about", name: "About Me", icon: User },
  { id: "interests", name: "Interests", icon: Heart },
  { id: "achievements", name: "Achievements", icon: Shield },
  { id: "goals", name: "Goals", icon: Settings },
  { id: "quotes", name: "Favorite Quotes", icon: Globe },
]

interface CustomSection {
  id: string
  title: string
  content: string
  type: "text" | "list" | "achievements"
  visible: boolean
}

export function ProfileCustomization() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("appearance")

  const [customization, setCustomization] = useState({
    theme: "default",
    banner_color: "#3b82f6",
    banner_image: "",
    profile_layout: "standard",
    show_stats: true,
    show_badges: true,
    show_recent_activity: true,
    custom_sections: [] as CustomSection[],
    social_links: {
      twitter: "",
      instagram: "",
      linkedin: "",
      website: "",
    },
  })

  const [preferences, setPreferences] = useState({
    content_filters: {
      hide_sensitive: true,
      preferred_categories: [] as string[],
      blocked_keywords: [] as string[],
    },
    notifications: {
      email_digest: true,
      push_notifications: true,
      comment_notifications: true,
      message_notifications: true,
      weekly_digest: true,
    },
    privacy: {
      profile_visibility: "public",
      show_online_status: true,
      allow_messages: true,
      show_reading_list: true,
      show_connections: true,
    },
  })

  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user])

  const loadUserPreferences = async () => {
    try {
      const { data } = await supabase.from("user_preferences").select("*").eq("user_id", user?.id).single()

      if (data) {
        if (data.theme_preferences) {
          setCustomization((prev) => ({ ...prev, ...data.theme_preferences }))
        }
        if (data.content_preferences) {
          setPreferences((prev) => ({ ...prev, content_filters: data.content_preferences }))
        }
        if (data.notification_preferences) {
          setPreferences((prev) => ({ ...prev, notifications: data.notification_preferences }))
        }
        if (data.privacy_preferences) {
          setPreferences((prev) => ({ ...prev, privacy: data.privacy_preferences }))
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    }
  }

  const savePreferences = async () => {
    if (!user) return

    setLoading(true)

    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        theme_preferences: customization,
        content_preferences: preferences.content_filters,
        notification_preferences: preferences.notifications,
        privacy_preferences: preferences.privacy,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Preferences saved!",
        description: "Your profile customization has been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: Date.now().toString(),
      title: "New Section",
      content: "",
      type: "text",
      visible: true,
    }
    setCustomization((prev) => ({
      ...prev,
      custom_sections: [...prev.custom_sections, newSection],
    }))
  }

  const updateCustomSection = (id: string, updates: Partial<CustomSection>) => {
    setCustomization((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections.map((section) =>
        section.id === id ? { ...section, ...updates } : section,
      ),
    }))
  }

  const removeCustomSection = (id: string) => {
    setCustomization((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections.filter((section) => section.id !== id),
    }))
  }

  const uploadBannerImage = async (file: File) => {
    if (!user) return

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-banner-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("profile-images").upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("profile-images").getPublicUrl(fileName)

      setCustomization((prev) => ({ ...prev, banner_image: data.publicUrl }))
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customize Your Profile</h1>
          <p className="text-muted-foreground">Personalize your profile to reflect your unique story and style</p>
        </div>
        <Button onClick={savePreferences} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Settings className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <User className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Choose Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        customization.theme === theme.id
                          ? "border-primary"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                      onClick={() => setCustomization((prev) => ({ ...prev, theme: theme.id }))}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                      </div>
                      <p className="text-sm font-medium">{theme.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Banner</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={customization.banner_color}
                      onChange={(e) =>
                        setCustomization((prev) => ({
                          ...prev,
                          banner_color: e.target.value,
                        }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">Banner Color</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner-upload">Upload Banner Image</Label>
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadBannerImage(file)
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Profile Layout</Label>
                <Select
                  value={customization.profile_layout}
                  onValueChange={(value) =>
                    setCustomization((prev) => ({
                      ...prev,
                      profile_layout: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_stats"
                  checked={customization.show_stats}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({
                      ...prev,
                      show_stats: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="show_stats">Show profile statistics</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_badges"
                  checked={customization.show_badges}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({
                      ...prev,
                      show_badges: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="show_badges">Show achievement badges</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_recent_activity"
                  checked={customization.show_recent_activity}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({
                      ...prev,
                      show_recent_activity: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="show_recent_activity">Show recent activity</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs content here */}
      </Tabs>
    </div>
  )
}
