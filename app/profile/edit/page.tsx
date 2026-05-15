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
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, MapPin, Users, Heart, X, Shield, Briefcase, Home, Baby, UserCheck, Camera, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

// South African specific data
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

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "transgender-male", label: "Transgender Male" },
  { value: "transgender-female", label: "Transgender Female" },
  { value: "genderfluid", label: "Genderfluid" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

const ethnicityOptions = [
  { value: "black-african", label: "Black African" },
  { value: "coloured", label: "Coloured" },
  { value: "indian", label: "Indian / Asian" },
  { value: "white", label: "White" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

const educationLevels = [
  "No formal education",
  "Some primary school",
  "Completed primary school",
  "Some high school",
  "Matric/Grade 12",
  "Post-matric certificate",
  "Diploma",
  "Bachelor's degree",
  "Honours degree",
  "Master's degree",
  "Doctoral degree",
  "Trade qualification",
  "Adult Basic Education",
  "Skills development course",
]

const employmentStatuses = [
  "Employed full-time",
  "Employed part-time",
  "Self-employed",
  "Unemployed - looking for work",
  "Unemployed - not looking for work",
  "Student",
  "Retired",
  "Unable to work due to disability",
  "Homemaker/caregiver",
  "Volunteer work",
]

const incomeRanges = [
  "No income",
  "R1 - R1,000",
  "R1,001 - R3,500",
  "R3,501 - R7,000",
  "R7,001 - R15,000",
  "R15,001 - R30,000",
  "R30,001 - R50,000",
  "R50,001+",
  "Prefer not to say",
]

const housingTypes = [
  "RDP house",
  "Bond house",
  "Rental house",
  "Flat/apartment",
  "Room in backyard",
  "Informal settlement/shack",
  "Traditional dwelling",
  "Hostel",
  "Living with family",
  "Homeless/temporary shelter",
]

const householdSizes = ["1 person (just me)", "2 people", "3-4 people", "5-6 people", "7-8 people", "9+ people"]

const relationshipStatuses = [
  "Single",
  "In a relationship",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
  "It's complicated",
  "Prefer not to say",
]

const childrenOptions = [
  "No children",
  "Expecting first child",
  "1 child",
  "2 children",
  "3 children",
  "4+ children",
  "Prefer not to say",
]

const transportMethods = [
  "Walk",
  "Bicycle",
  "Taxi/minibus",
  "Bus",
  "Train",
  "Own car",
  "Motorcycle/scooter",
  "Uber/Bolt",
  "Lift from others",
  "No regular transport",
]

const languages = [
  "Afrikaans",
  "English",
  "isiNdebele",
  "isiXhosa",
  "isiZulu",
  "Sepedi",
  "Sesotho",
  "Setswana",
  "siSwati",
  "Tshivenda",
  "Xitsonga",
  "Portuguese",
  "French",
  "Other",
]

const interests = [
  "Education & Learning",
  "Healthcare & Wellness",
  "Mental Health",
  "Entrepreneurship & Business",
  "Arts & Culture",
  "Music & Dance",
  "Sports & Fitness",
  "Technology & Digital Skills",
  "Agriculture & Farming",
  "Community Development",
  "Youth Development",
  "Women's Rights & Empowerment",
  "LGBTQ+ Rights",
  "Environmental Issues",
  "Politics & Governance",
  "Religion & Spirituality",
  "Social Justice",
  "Economic Empowerment",
  "Skills Development",
  "Childcare & Parenting",
  "Cooking & Food",
  "Gardening",
  "Reading & Writing",
  "Photography",
  "Crafts & Handwork",
  "Traditional Healing",
  "Language Learning",
]

const challenges = [
  "Unemployment",
  "Poverty & Financial Hardship",
  "Crime & Safety Concerns",
  "Substance Abuse",
  "Domestic Violence",
  "Food Insecurity",
  "Healthcare Access",
  "Education Access",
  "Transport Difficulties",
  "Mental Health Issues",
  "Discrimination",
  "Housing Problems",
  "Lack of Documentation",
  "Language Barriers",
  "Disability Challenges",
  "Single Parenting",
  "Caring for Elderly",
  "Teen Pregnancy",
  "HIV/AIDS",
  "Chronic Illness",
  "Debt Problems",
  "Lack of Skills",
  "Social Isolation",
]

const supportTypes = [
  "Job Search Assistance",
  "Skills Training & Development",
  "Education Support",
  "Healthcare Access",
  "Mental Health Support",
  "Legal Assistance",
  "Housing Assistance",
  "Food Assistance",
  "Childcare Support",
  "Transport Assistance",
  "Language Learning",
  "Computer & Digital Literacy",
  "Financial Literacy",
  "Entrepreneurship Support",
  "Counseling & Emotional Support",
  "Domestic Violence Support",
  "Substance Abuse Recovery",
  "Disability Support",
  "Documentation Help",
  "Mentorship",
  "Networking Opportunities",
  "Community Organizing",
  "Advocacy & Rights",
  "Traditional Healing",
  "Spiritual Guidance",
]

const healthConditions = [
  "Diabetes",
  "High Blood Pressure",
  "HIV/AIDS",
  "Tuberculosis",
  "Heart Disease",
  "Mental Health Conditions",
  "Chronic Pain",
  "Arthritis",
  "Asthma",
  "Cancer",
  "Kidney Disease",
  "Epilepsy",
  "Other chronic condition",
]

const disabilityTypes = [
  "Physical disability",
  "Visual impairment",
  "Hearing impairment",
  "Intellectual disability",
  "Mental health disability",
  "Multiple disabilities",
  "Other",
]

export default function EditProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Comprehensive form data
  const [formData, setFormData] = useState({
    // Basic Information
    display_name: "",
    use_pseudonym: false,
    pseudonym: "",
    bio: "",

    // Demographics
    age_range: "",
    gender: "",
    ethnicity: "",
    nationality: "South African",
    languages_spoken: [] as string[],

    // Location
    province: "",
    township: "",
    area_description: "",
    location: "",

    // Housing & Living Situation
    housing_type: "",
    household_size: "",

    // Employment & Economics
    employment_status: "",
    occupation: "",
    income_range: "",
    education_level: "",
    skills: "",

    // Family & Relationships
    relationship_status: "",
    has_children: "",
    number_of_children: "",
    children_ages: "",
    is_caregiver: false,
    caregiver_for: "",

    // Health & Wellbeing
    health_conditions: [] as string[],
    has_disability: "",
    disability_type: "",

    // Transport & Community
    transport_method: [] as string[],
    community_involvement: "",
    religious_affiliation: "",

    // Interests & Experience
    interests: [] as string[],
    volunteer_experience: "",

    // Challenges & Support
    current_challenges: [] as string[],
    support_needed: [] as string[],
    support_can_provide: [] as string[],

    // Privacy Settings
    looking_for_connections: true,
    share_location: true,
    share_demographics: true,
    share_challenges: true,
    share_contact: false,
    contact_method: "",
  })

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // If no user after auth loads, redirect to home
    if (!user) {
      router.push("/")
      return
    }

    // Mark page as ready once we have a user
    setPageReady(true)

    // Set avatar URL from profile
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url)
    }

    // Load profile data if available
    if (profile && profile.id !== "offline") {
      loadProfileData()
    }
  }, [user, profile, authLoading, router])

  const loadProfileData = async () => {
    if (!user || !profile || profile.id === "offline") return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user?.id).single()

      if (data) {
        setFormData({
          display_name: data.full_name || "",
          use_pseudonym: data.use_pseudonym || false,
          pseudonym: data.pseudonym || "",
          bio: data.bio || "",
          age_range: data.age_range || "",
          gender: data.gender || "",
          ethnicity: data.ethnicity || "",
          nationality: data.nationality || "South African",
          languages_spoken: data.languages_spoken || [],
          province: data.province || "",
          township: data.township || "",
          area_description: data.area_description || "",
          location: data.location || "",
          housing_type: data.housing_type || "",
          household_size: data.household_size || "",
          employment_status: data.employment_status || "",
          occupation: data.occupation || "",
          income_range: data.income_range || "",
          education_level: data.education_level || "",
          skills: data.skills || "",
          relationship_status: data.relationship_status || "",
          has_children: data.has_children || "",
          number_of_children: data.number_of_children || "",
          children_ages: data.children_ages || "",
          is_caregiver: data.is_caregiver || false,
          caregiver_for: data.caregiver_for || "",
          health_conditions: data.health_conditions || [],
          has_disability: data.has_disability || "",
          disability_type: data.disability_type || "",
          transport_method: data.transport_method || [],
          community_involvement: data.community_involvement || "",
          religious_affiliation: data.religious_affiliation || "",
          interests: data.interests || [],
          volunteer_experience: data.volunteer_experience || "",
          current_challenges: data.current_challenges || [],
          support_needed: data.support_needed || [],
          support_can_provide: data.support_can_provide || [],
          looking_for_connections: data.looking_for_connections ?? true,
          share_location: data.share_location ?? true,
          share_demographics: data.share_demographics ?? true,
          share_challenges: data.share_challenges ?? true,
          share_contact: data.share_contact ?? false,
          contact_method: data.contact_method || "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const handleArrayToggle = (array: string[], item: string, field: keyof typeof formData) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
    setFormData((prev) => ({ ...prev, [field]: newArray }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingAvatar(true)

    try {
      // Upload to Vercel Blob
      const filename = `avatars/${user.id}-${Date.now()}.${file.name.split(".").pop()}`
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await response.json()

      // Update profile with new avatar URL
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)

      if (error) throw error

      setAvatarUrl(url)
      refreshProfile()

      toast({
        title: "Profile picture updated!",
        description: "Your new profile picture has been saved.",
      })
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Columns that actually exist in the simplified "profiles" table
      const updateData: any = {
        full_name: formData.display_name?.trim() || formData.pseudonym?.trim() || null,
        bio: formData.bio?.trim() || null,
        location: formData.location?.trim() || null,
        gender: formData.gender || null,
        ethnicity: formData.ethnicity || null,
        updated_at: new Date().toISOString(),
      }

      // Optional username change (use pseudonym if user checked the box)
      if (formData.use_pseudonym && formData.pseudonym.trim()) {
        updateData.username = formData.pseudonym.trim()
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user?.id)

      if (error) {
        throw error
      } else {
        toast({
          title: "Profile updated!",
          description: "Your comprehensive profile has been successfully updated.",
        })
      }

      if (profile?.username && profile.username !== "offline-user") {
        router.push(`/profile/${profile.username}`)
      } else {
        router.push("/") // fallback – shouldn't happen, but keeps the app stable
      }
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

  // Show loading state while auth is being verified
  if (authLoading || !pageReady) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            {profile?.username && profile.username !== "offline-user" ? (
              <Link href={`/profile/${profile.username}`}>
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground mt-2">
              Help us understand your background, experiences, and interests so we can connect you with the right
              community members and resources.
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
                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-border">
                        <AvatarImage src={avatarUrl || profile?.avatar_url || ""} alt="Profile" />
                        <AvatarFallback className="text-2xl bg-primary/10">
                          {formData.display_name?.charAt(0)?.toUpperCase() || 
                           profile?.full_name?.charAt(0)?.toUpperCase() || 
                           user?.email?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Click the camera icon to upload a new profile picture.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: JPG, PNG, GIF. Max size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name (Optional)</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                    placeholder="How would you like to be known?"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use_pseudonym"
                    checked={formData.use_pseudonym}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, use_pseudonym: checked as boolean }))
                    }
                  />
                  <Label htmlFor="use_pseudonym">I prefer to use a pseudonym for privacy</Label>
                </div>

                {formData.use_pseudonym && (
                  <div className="space-y-2">
                    <Label htmlFor="pseudonym">Pseudonym</Label>
                    <Input
                      id="pseudonym"
                      value={formData.pseudonym}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pseudonym: e.target.value }))}
                      placeholder="Your chosen pseudonym"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bio">About You</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself, your background, what's important to you..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age_range">Age Range</Label>
                    <Select
                      value={formData.age_range}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, age_range: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your age range" />
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
                        <SelectValue placeholder="Select gender identity" />
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
                    <Label htmlFor="ethnicity">Ethnicity (helps with AI cover images)</Label>
                    <Select
                      value={formData.ethnicity}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, ethnicity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ethnicity" />
                      </SelectTrigger>
                      <SelectContent>
                        {ethnicityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This helps our AI generate more representative cover images for your stories.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Languages You Speak</Label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language) => (
                      <Badge
                        key={language}
                        variant={formData.languages_spoken.includes(language) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleArrayToggle(formData.languages_spoken, language, "languages_spoken")}
                      >
                        {language}
                        {formData.languages_spoken.includes(language) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Housing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location & Housing
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
                        <SelectValue placeholder="Select your province" />
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
                    <Label htmlFor="township">Township/Area/City</Label>
                    <Input
                      id="township"
                      value={formData.township}
                      onChange={(e) => setFormData((prev) => ({ ...prev, township: e.target.value }))}
                      placeholder="e.g., Soweto, Khayelitsha, Sandton"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area_description">Area Description (Optional)</Label>
                  <Input
                    id="area_description"
                    value={formData.area_description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, area_description: e.target.value }))}
                    placeholder="Describe your neighborhood or area"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="housing_type">Housing Type</Label>
                    <Select
                      value={formData.housing_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, housing_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select housing type" />
                      </SelectTrigger>
                      <SelectContent>
                        {housingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="household_size">Household Size</Label>
                    <Select
                      value={formData.household_size}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, household_size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How many people live in your household?" />
                      </SelectTrigger>
                      <SelectContent>
                        {householdSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment & Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Employment & Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment_status">Employment Status</Label>
                    <Select
                      value={formData.employment_status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, employment_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation/Job Title</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))}
                      placeholder="What do you do for work?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education_level">Highest Education Level</Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, education_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income_range">Monthly Income Range</Label>
                    <Select
                      value={formData.income_range}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, income_range: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        {incomeRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills & Talents</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
                    placeholder="What skills do you have? (e.g., cooking, computer skills, crafts, languages, etc.)"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Family & Relationships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Baby className="h-5 w-5 mr-2" />
                  Family & Relationships
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationship_status">Relationship Status</Label>
                    <Select
                      value={formData.relationship_status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship status" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
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
                        {childrenOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.has_children && !["No children", "Prefer not to say"].includes(formData.has_children) && (
                  <div className="space-y-2">
                    <Label htmlFor="children_ages">Ages of Children (Optional)</Label>
                    <Input
                      id="children_ages"
                      value={formData.children_ages}
                      onChange={(e) => setFormData((prev) => ({ ...prev, children_ages: e.target.value }))}
                      placeholder="e.g., 5, 12, 16 or toddler, teenager"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_caregiver"
                    checked={formData.is_caregiver}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_caregiver: checked as boolean }))
                    }
                  />
                  <Label htmlFor="is_caregiver">
                    I am a caregiver for someone (elderly parent, disabled family member, etc.)
                  </Label>
                </div>

                {formData.is_caregiver && (
                  <div className="space-y-2">
                    <Label htmlFor="caregiver_for">Who do you care for?</Label>
                    <Input
                      id="caregiver_for"
                      value={formData.caregiver_for}
                      onChange={(e) => setFormData((prev) => ({ ...prev, caregiver_for: e.target.value }))}
                      placeholder="e.g., elderly mother, disabled child, etc."
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health & Wellbeing */}
            <Card>
              <CardHeader>
                <CardTitle>Health & Wellbeing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Health Conditions (Optional - only share what you're comfortable with)</Label>
                  <p className="text-sm text-muted-foreground">
                    This helps us connect you with others who understand similar health challenges
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {healthConditions.map((condition) => (
                      <Badge
                        key={condition}
                        variant={formData.health_conditions.includes(condition) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleArrayToggle(formData.health_conditions, condition, "health_conditions")}
                      >
                        {condition}
                        {formData.health_conditions.includes(condition) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="has_disability">Do you have a disability?</Label>
                  <Select
                    value={formData.has_disability}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, has_disability: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.has_disability === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="disability_type">Type of Disability (Optional)</Label>
                    <Select
                      value={formData.disability_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, disability_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select disability type" />
                      </SelectTrigger>
                      <SelectContent>
                        {disabilityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transport & Community */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Transport & Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>How do you usually get around?</Label>
                  <div className="flex flex-wrap gap-2">
                    {transportMethods.map((method) => (
                      <Badge
                        key={method}
                        variant={formData.transport_method.includes(method) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleArrayToggle(formData.transport_method, method, "transport_method")}
                      >
                        {method}
                        {formData.transport_method.includes(method) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community_involvement">Community Involvement</Label>
                  <Textarea
                    id="community_involvement"
                    value={formData.community_involvement}
                    onChange={(e) => setFormData((prev) => ({ ...prev, community_involvement: e.target.value }))}
                    placeholder="Are you involved in any community organizations, church groups, sports clubs, etc.?"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religious_affiliation">Religious/Spiritual Affiliation (Optional)</Label>
                  <Input
                    id="religious_affiliation"
                    value={formData.religious_affiliation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, religious_affiliation: e.target.value }))}
                    placeholder="e.g., Christian, Muslim, Traditional African Religion, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interests & Passions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Interests & Passions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>What are you interested in or passionate about?</Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleArrayToggle(formData.interests, interest, "interests")}
                      >
                        {interest}
                        {formData.interests.includes(interest) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer_experience">Volunteer Experience</Label>
                  <Textarea
                    id="volunteer_experience"
                    value={formData.volunteer_experience}
                    onChange={(e) => setFormData((prev) => ({ ...prev, volunteer_experience: e.target.value }))}
                    placeholder="Tell us about any volunteer work or community service you've done"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Challenges & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Challenges & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Current Challenges</Label>
                  <p className="text-sm text-muted-foreground">
                    What challenges are you currently facing? This helps us connect you with others who understand and
                    can offer support.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {challenges.map((challenge) => (
                      <Badge
                        key={challenge}
                        variant={formData.current_challenges.includes(challenge) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleArrayToggle(formData.current_challenges, challenge, "current_challenges")}
                      >
                        {challenge}
                        {formData.current_challenges.includes(challenge) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Support You Need</Label>
                  <p className="text-sm text-muted-foreground">
                    What kind of support would be helpful to you right now?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {supportTypes.map((support) => (
                      <Badge
                        key={support}
                        variant={formData.support_needed.includes(support) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleArrayToggle(formData.support_needed, support, "support_needed")}
                      >
                        {support}
                        {formData.support_needed.includes(support) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Support You Can Provide</Label>
                  <p className="text-sm text-muted-foreground">
                    How can you help others in your community? What support or assistance can you offer?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {supportTypes.map((support) => (
                      <Badge
                        key={support}
                        variant={formData.support_can_provide.includes(support) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleArrayToggle(formData.support_can_provide, support, "support_can_provide")}
                      >
                        {support}
                        {formData.support_can_provide.includes(support) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Connection Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Privacy & Connection Settings
                </CardTitle>
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
                    <Label htmlFor="looking_for_connections">I'm open to connecting with others in the community</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share_location"
                      checked={formData.share_location}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, share_location: checked as boolean }))
                      }
                    />
                    <Label htmlFor="share_location">Share my location information with others</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share_demographics"
                      checked={formData.share_demographics}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, share_demographics: checked as boolean }))
                      }
                    />
                    <Label htmlFor="share_demographics">Share my demographic information (age, gender, etc.)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share_challenges"
                      checked={formData.share_challenges}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, share_challenges: checked as boolean }))
                      }
                    />
                    <Label htmlFor="share_challenges">Share my challenges and support needs with others</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share_contact"
                      checked={formData.share_contact}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, share_contact: checked as boolean }))
                      }
                    />
                    <Label htmlFor="share_contact">Allow others to contact me directly</Label>
                  </div>

                  {formData.share_contact && (
                    <div className="space-y-2">
                      <Label htmlFor="contact_method">Preferred Contact Method</Label>
                      <Input
                        id="contact_method"
                        value={formData.contact_method}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contact_method: e.target.value }))}
                        placeholder="e.g., WhatsApp, Email, Phone"
                      />
                    </div>
                  )}
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
