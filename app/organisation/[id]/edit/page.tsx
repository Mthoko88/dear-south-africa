"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { ArrowLeft, Building2, Upload, Loader2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { use } from "react"

const ORGANISATION_TYPES = [
  { value: "admin", label: "Admin (Platform Administrator)" },
  { value: "ngo", label: "Non-Governmental Organisation (NGO)" },
  { value: "npo", label: "Non-Profit Organisation (NPO)" },
  { value: "cbo", label: "Community-Based Organisation (CBO)" },
  { value: "csi", label: "Corporate Social Investment (CSI)" },
  { value: "faith", label: "Faith-Based Organisation" },
  { value: "foundation", label: "Foundation" },
  { value: "trust", label: "Trust" },
  { value: "cooperative", label: "Cooperative" },
  { value: "social_enterprise", label: "Social Enterprise" },
  { value: "other", label: "Other" },
]

const FOCUS_AREAS = [
  "Mental Health",
  "Gender-Based Violence",
  "Youth Development",
  "Education",
  "Health & Wellness",
  "Poverty Alleviation",
  "Community Development",
  "Environmental",
  "Human Rights",
  "Disability Support",
  "Addiction & Recovery",
  "Child Welfare",
  "Elderly Care",
  "Refugee & Migrant Support",
  "Other",
]

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
  "National (All Provinces)",
]

interface Organisation {
  id: string
  trading_name: string
  registered_name: string | null
  organisation_type: string
  registration_number: string | null
  description: string
  mission_statement: string | null
  logo_url: string | null
  website: string | null
  email: string
  phone: string | null
  physical_address: string | null
  city: string | null
  province: string | null
  focus_areas: string[] | null
  beneficiary_demographics: any
  facebook_url: string | null
  instagram_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  user_id: string
}

export default function EditOrganisationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    trading_name: "",
    registered_name: "",
    organisation_type: "",
    registration_number: "",
    description: "",
    mission_statement: "",
    website: "",
    email: "",
    phone: "",
    physical_address: "",
    city: "",
    province: "",
    focus_areas: [] as string[],
    beneficiary_demographics: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/")
      return
    }
    loadOrganisation()
  }, [user, authLoading, resolvedParams.id])

  const loadOrganisation = async () => {
    try {
      const { data, error } = await supabase
        .from("organisations")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (error) throw error

      if (data.user_id !== user?.id) {
        toast({
          title: "Access denied",
          description: "You don't have permission to edit this organisation.",
          variant: "destructive",
        })
        router.push(`/organisation/${resolvedParams.id}`)
        return
      }

      setOrganisation(data)
      setFormData({
        trading_name: data.trading_name || "",
        registered_name: data.registered_name || "",
        organisation_type: data.organisation_type || "",
        registration_number: data.registration_number || "",
        description: data.description || "",
        mission_statement: data.mission_statement || "",
        website: data.website || "",
        email: data.email || "",
        phone: data.phone || "",
        physical_address: data.physical_address || "",
        city: data.city || "",
        province: data.province || "",
        focus_areas: data.focus_areas || [],
        beneficiary_demographics: typeof data.beneficiary_demographics === 'object' 
          ? data.beneficiary_demographics?.description || "" 
          : "",
        facebook_url: data.facebook_url || "",
        instagram_url: data.instagram_url || "",
        twitter_url: data.twitter_url || "",
        linkedin_url: data.linkedin_url || "",
      })
      setLogoPreview(data.logo_url)
    } catch (error) {
      console.error("Error loading organisation:", error)
      toast({
        title: "Error",
        description: "Failed to load organisation details.",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !organisation) return

    setSaving(true)

    try {
      let logoUrl = organisation.logo_url

      // Upload new logo if provided
      if (logoFile) {
        const filename = `org-logos/${user.id}-${Date.now()}-${logoFile.name}`
        const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
          method: "POST",
          body: logoFile,
        })
        if (response.ok) {
          const { url } = await response.json()
          logoUrl = url
        }
      }

      // Update organisation
      const { error } = await supabase
        .from("organisations")
        .update({
          trading_name: formData.trading_name,
          registered_name: formData.registered_name || null,
          organisation_type: formData.organisation_type,
          registration_number: formData.registration_number || null,
          description: formData.description,
          mission_statement: formData.mission_statement || null,
          logo_url: logoUrl,
          website: formData.website || null,
          email: formData.email,
          phone: formData.phone || null,
          physical_address: formData.physical_address || null,
          city: formData.city || null,
          province: formData.province || null,
          focus_areas: formData.focus_areas.length > 0 ? formData.focus_areas : null,
          beneficiary_demographics: formData.beneficiary_demographics?.trim()
            ? { description: formData.beneficiary_demographics.trim() } 
            : null,
          facebook_url: formData.facebook_url || null,
          instagram_url: formData.instagram_url || null,
          twitter_url: formData.twitter_url || null,
          linkedin_url: formData.linkedin_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", organisation.id)

      if (error) throw error

      toast({
        title: "Organisation updated!",
        description: "Your changes have been saved.",
      })

      router.push(`/organisation/${organisation.id}`)
    } catch (error: any) {
      console.error("Error updating organisation:", error)
      const errorMessage = error?.message || error?.details || "Failed to update organisation. Please try again."
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href={`/organisation/${resolvedParams.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Organisation</h1>
          <p className="text-muted-foreground mt-2">
            Update your organisation&apos;s information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-border">
                  {logoPreview ? (
                    <AvatarImage src={logoPreview} alt="Organisation logo" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10">
                    <Building2 className="h-10 w-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 200x200px, max 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trading_name">Trading Name *</Label>
                <Input
                  id="trading_name"
                  value={formData.trading_name}
                  onChange={(e) => setFormData({ ...formData, trading_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registered_name">Registered Name</Label>
                <Input
                  id="registered_name"
                  value={formData.registered_name}
                  onChange={(e) => setFormData({ ...formData, registered_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organisation_type">Organisation Type *</Label>
                <Select
                  value={formData.organisation_type}
                  onValueChange={(value) => setFormData({ ...formData, organisation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANISATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission_statement">Mission Statement</Label>
                <Textarea
                  id="mission_statement"
                  value={formData.mission_statement}
                  onChange={(e) => setFormData({ ...formData, mission_statement: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="physical_address">Physical Address</Label>
                <Textarea
                  id="physical_address"
                  value={formData.physical_address}
                  onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Areas</CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <Badge
                    key={area}
                    variant={formData.focus_areas.includes(area) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleFocusAreaToggle(area)}
                  >
                    {area}
                    {formData.focus_areas.includes(area) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="beneficiary_demographics">Who do you serve?</Label>
                <Textarea
                  id="beneficiary_demographics"
                  value={formData.beneficiary_demographics}
                  onChange={(e) => setFormData({ ...formData, beneficiary_demographics: e.target.value })}
                  placeholder="Describe your beneficiaries..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_url">Twitter / X</Label>
                <Input
                  id="twitter_url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/organisation/${resolvedParams.id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
