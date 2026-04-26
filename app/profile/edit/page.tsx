"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, MapPin, Users, Heart, X } from "lucide-react"
import Link from "next/link"

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

const townships = [
  "Alexandra",
  "Khayelitsha",
  "Soweto",
  "Mitchells Plain",
  "Gugulethu",
  "Langa",
  "Nyanga",
  "Philippi",
  "Delft",
  "Manenberg",
  "Hanover Park",
  "Lavender Hill",
  "Tembisa",
  "Daveyton",
  "KwaThema",
  "Duduza",
  "Vosloorus",
  "Thokoza",
  "Sebokeng",
  "Evaton",
  "Sharpeville",
  "Boipatong",
  "Orange Farm",
  "Eldorado Park",
  "Lenasia",
  "Diepsloot",
  "Ivory Park",
  "Zandspruit",
  "Cosmo City",
  "Mamelodi",
  "Atteridgeville",
  "Soshanguve",
  "Hammanskraal",
  "Ga-Rankuwa",
  "Mabopane",
  "Umlazi",
  "KwaMashu",
  "Chatsworth",
  "Phoenix",
  "Inanda",
  "Ntuzuma",
  "Lamontville",
  "Chesterville",
  "Cato Crest",
  "Clermont",
  "Pinetown",
]

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "genderfluid", label: "Gender fluid" },
  { value: "transgender-male", label: "Transgender male" },
  { value: "transgender-female", label: "Transgender female" },
  { value: "two-spirit", label: "Two-spirit" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

const interests = [
  "Education",
  "Healthcare",
  "Mental Health",
  "Entrepreneurship",
  "Arts & Culture",
  "Sports",
  "Music",
  "Technology",
  "Agriculture",
  "Community Development",
  "Youth Development",
  "Women's Rights",
  "LGBTQ+ Rights",
  "Environmental Issues",
  "Politics",
  "Religion & Spirituality",
  "Traditional Healing",
  "Language & Literature",
  "History",
  "Social Justice",
  "Economic Empowerment",
  "Skills Development",
]

const challenges = [
  "Unemployment",
  "Poverty",
  "Education Access",
  "Healthcare Access",
  "Mental Health",
  "Substance Abuse",
  "Domestic Violence",
  "Crime & Safety",
  "Housing",
  "Transport",
  "Single Parenting",
  "Teen Pregnancy",
  "HIV/AIDS",
  "Disability",
  "Elderly Care",
  "Youth at Risk",
  "Gender-based Violence",
  "Discrimination",
  "Language Barriers",
  "Digital Divide",
  "Food Security",
  "Water & Sanitation",
]

export default function EditProfilePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: "",
    use_pseudonym: false,
    pseudonym: "",
    bio: "",
    age_range: "",
    gender: "",
    province: "",
    township: "",
    area_description: "",
    interests: [] as string[],
    challenges_faced: [] as string[],
    willing_to_help_with: [] as string[],
    languages: "",
    occupation: "",
    education_level: "",
    relationship_status: "",
    has_children: "",
    looking_for_connections: true,
    share_location: true,
    share_age: true,
    share_gender: true,
  })

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (profile) {
      loadProfileData()
    }
  }, [user, profile])

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

      if (data) {
        setFormData({
          display_name: data.display_name || data.full_name || "",
          use_pseudonym: data.use_pseudonym || false,
          pseudonym: data.pseudonym || "",
          bio: data.bio || "",
          age_range: data.age_range || "",
          gender: data.gender || "",
          province: data.province || "",
          township: data.township || "",
          area_description: data.area_description || "",
          interests: data.interests || [],
          challenges_faced: data.challenges_faced || [],
          willing_to_help_with: data.willing_to_help_with || [],
          languages: data.languages || "",
          occupation: data.occupation || "",
          education_level: data.education_level || "",
          relationship_status: data.relationship_status || "",
          has_children: data.has_children || "",
          looking_for_connections: data.looking_for_connections ?? true,
          share_location: data.share_location ?? true,
          share_age: data.share_age ?? true,
          share_gender: data.share_gender ?? true,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleChallengeToggle = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges_faced: prev.challenges_faced.includes(challenge)
        ? prev.challenges_faced.filter((c) => c !== challenge)
        : [...prev.challenges_faced, challenge],
    }))
  }

  const handleHelpToggle = (help: string) => {
    setFormData((prev) => ({
      ...prev,
      willing_to_help_with: prev.willing_to_help_with.includes(help)
        ? prev.willing_to_help_with.filter((h) => h !== help)
        : [...prev.willing_to_help_with, help],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          use_pseudonym: formData.use_pseudonym,
          pseudonym: formData.pseudonym,
          bio: formData.bio,
          age_range: formData.age_range,
          gender: formData.gender,
          province: formData.province,
          township: formData.township,
          area_description: formData.area_description,
          interests: formData.interests,
          challenges_faced: formData.challenges_faced,
          willing_to_help_with: formData.willing_to_help_with,
          languages: formData.languages,
          occupation: formData.occupation,
          education_level: formData.education_level,
          relationship_status: formData.relationship_status,
          has_children: formData.has_children,
          looking_for_connections: formData.looking_for_connections,
          share_location: formData.share_location,
          share_age: formData.share_age,
          share_gender: formData.share_gender,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (error) throw error

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      })

      router.push(`/profile/${profile?.username}`)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/profile/${profile?.username}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Your Profile</h1>
            <p className="text-muted-foreground mt-2">
              Help others connect with you by sharing what feels comfortable. Your story matters more than your
              identity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                      placeholder="How you want to be known"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="use_pseudonym"
                        checked={formData.use_pseudonym}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, use_pseudonym: checked as boolean }))
                        }
                      />
                      <Label htmlFor="use_pseudonym">Use a pseudonym for stories</Label>
                    </div>
                    {formData.use_pseudonym && (
                      <Input
                        placeholder="Your pseudonym"
                        value={formData.pseudonym}
                        onChange={(e) => setFormData((prev) => ({ ...prev, pseudonym: e.target.value }))}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us a bit about yourself..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age_range">Age Range</Label>
                    <Select
                      value={formData.age_range}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, age_range: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-18">Under 18</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55-64">55-64</SelectItem>
                        <SelectItem value="65-plus">65+</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Identity</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages</Label>
                    <Input
                      id="languages"
                      value={formData.languages}
                      onChange={(e) => setFormData((prev) => ({ ...prev, languages: e.target.value }))}
                      placeholder="e.g., Zulu, English, Afrikaans"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location & Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, province: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="township">Township/Area</Label>
                    <Select
                      value={formData.township}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, township: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select township/area" />
                      </SelectTrigger>
                      <SelectContent>
                        {townships.map((township) => (
                          <SelectItem key={township} value={township}>
                            {township}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area_description">Area Description (Optional)</Label>
                  <Input
                    id="area_description"
                    value={formData.area_description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, area_description: e.target.value }))}
                    placeholder="e.g., Near the clinic, Zone 4, Extension 2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interests & Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Interests & Experiences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Interests & Passions</Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                        {formData.interests.includes(interest) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Challenges You've Faced</Label>
                  <p className="text-sm text-muted-foreground">
                    This helps connect you with others who understand your journey
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {challenges.map((challenge) => (
                      <Badge
                        key={challenge}
                        variant={formData.challenges_faced.includes(challenge) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleChallengeToggle(challenge)}
                      >
                        {challenge}
                        {formData.challenges_faced.includes(challenge) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Willing to Help Others With</Label>
                  <p className="text-sm text-muted-foreground">
                    Share your experience and support others facing similar challenges
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {challenges.map((help) => (
                      <Badge
                        key={help}
                        variant={formData.willing_to_help_with.includes(help) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleHelpToggle(help)}
                      >
                        {help}
                        {formData.willing_to_help_with.includes(help) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))}
                      placeholder="Your job or main activity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education_level">Education Level</Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, education_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary School</SelectItem>
                        <SelectItem value="secondary">High School</SelectItem>
                        <SelectItem value="matric">Matric</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="degree">University Degree</SelectItem>
                        <SelectItem value="postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationship_status">Relationship Status</Label>
                    <Select
                      value={formData.relationship_status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="in-relationship">In a relationship</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="has_children">Children</Label>
                    <Select
                      value={formData.has_children}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, has_children: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Do you have children?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Connection Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="looking_for_connections"
                      checked={formData.looking_for_connections}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, looking_for_connections: checked as boolean }))
                      }
                    />
                    <Label htmlFor="looking_for_connections">I'm open to connecting with others</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share_location"
                      checked={formData.share_location}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, share_location: checked as boolean }))
                      }
                    />
                    <Label htmlFor="share_location">Share my location with others</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share_age"
                      checked={formData.share_age}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, share_age: checked as boolean }))}
                    />
                    <Label htmlFor="share_age">Share my age range</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share_gender"
                      checked={formData.share_gender}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, share_gender: checked as boolean }))
                      }
                    />
                    <Label htmlFor="share_gender">Share my gender identity</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
