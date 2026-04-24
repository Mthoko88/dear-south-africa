"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Search,
  Plus,
  AlertTriangle,
  Heart,
  Briefcase,
  GraduationCap,
  Home,
  Shield,
  Stethoscope,
  Scale,
  Users,
  RefreshCw,
  Upload,
  X,
} from "lucide-react"
import Image from "next/image"

interface Resource {
  id: string
  name: string
  description: string
  category: string
  contact_info: any // jsonb field
  location: string
  province: string
  is_verified: boolean
  website_url: string | null
  phone_number: string | null
  email: string | null
  services_offered: string[] | null
  target_demographics: string[] | null
  cost_info: string | null
  availability_hours: string | null
  languages_supported: string[] | null
  logo_url: string | null // Added logo_url field
  created_at: string
  updated_at: string
}

const resourceCategories = [
  { value: "healthcare", label: "Healthcare", icon: Stethoscope },
  { value: "mental-health", label: "Mental Health", icon: Heart },
  { value: "legal-aid", label: "Legal Aid", icon: Scale },
  { value: "employment", label: "Employment", icon: Briefcase },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "housing", label: "Housing", icon: Home },
  { value: "domestic-violence", label: "Domestic Violence", icon: Shield },
  { value: "substance-abuse", label: "Substance Abuse", icon: AlertTriangle },
  { value: "food-security", label: "Food Security", icon: Heart },
  { value: "disability-support", label: "Disability Support", icon: Users },
  { value: "youth-services", label: "Youth Services", icon: Users },
  { value: "elderly-care", label: "Elderly Care", icon: Heart },
  { value: "crisis-support", label: "Crisis Support", icon: AlertTriangle },
  { value: "other", label: "Other", icon: Users },
]

const provinces = [
  "All Provinces",
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

export function ResourceDirectory() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProvince, setSelectedProvince] = useState("All Provinces")
  const [showCrisisOnly, setShowCrisisOnly] = useState(false)
  const [addResourceOpen, setAddResourceOpen] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [newResource, setNewResource] = useState({
    name: "",
    description: "",
    category: "",
    contact_info: "",
    location: "",
    phone_number: "",
    email: "",
    website_url: "",
    province: "",
    is_crisis_support: false,
    logo_url: "", // Added logo_url to state
  })

  useEffect(() => {
    fetchResources()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [resources, searchQuery, selectedCategory, selectedProvince, showCrisisOnly])

  const fetchResources = async () => {
    setLoading(true)
    try {
      // Fetch professional resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from("professional_resources")
        .select("*")
        .order("is_verified", { ascending: false })
        .order("created_at", { ascending: false })

      if (resourcesError) throw resourcesError

      // Fetch registered organisations (NGOs, NPOs, etc.) - exclude "Dear South Africa" platform
      const { data: orgsData, error: orgsError } = await supabase
        .from("organisations")
        .select("id, trading_name, description, organisation_type, province, city, phone, email, website, logo_url, is_verified, focus_areas, created_at")
        .neq("trading_name", "Dear South Africa")
        .order("is_verified", { ascending: false })
        .order("created_at", { ascending: false })

      if (orgsError) throw orgsError

      // Convert organisations to resource format
      const orgResources: Resource[] = (orgsData || []).map(org => ({
        id: `org-${org.id}`,
        name: org.trading_name,
        description: org.description || `${org.organisation_type?.toUpperCase() || 'Organisation'} based in ${org.city || org.province || 'South Africa'}`,
        category: mapOrgTypeToCategory(org.organisation_type, org.focus_areas),
        contact_info: {},
        location: org.city || "",
        province: org.province || "",
        is_verified: org.is_verified || false,
        website_url: org.website || null,
        phone_number: org.phone || null,
        email: org.email || null,
        services_offered: org.focus_areas || null,
        target_demographics: null,
        cost_info: null,
        availability_hours: null,
        languages_supported: null,
        logo_url: org.logo_url || null,
        created_at: org.created_at,
        updated_at: org.created_at,
      }))

      // Combine and set resources
      const allResources = [...(resourcesData || []), ...orgResources]
      setResources(allResources)
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  // Helper function to map organisation type to resource category
  const mapOrgTypeToCategory = (orgType: string | null, focusAreas: string[] | null): string => {
    if (focusAreas && focusAreas.length > 0) {
      const area = focusAreas[0].toLowerCase()
      if (area.includes("health") || area.includes("medical")) return "healthcare"
      if (area.includes("mental") || area.includes("counseling") || area.includes("counselling")) return "mental-health"
      if (area.includes("legal") || area.includes("rights")) return "legal-aid"
      if (area.includes("job") || area.includes("employment") || area.includes("skills")) return "employment"
      if (area.includes("education") || area.includes("school") || area.includes("learning")) return "education"
      if (area.includes("housing") || area.includes("shelter")) return "housing"
      if (area.includes("violence") || area.includes("abuse") || area.includes("gbv")) return "domestic-violence"
      if (area.includes("drug") || area.includes("alcohol") || area.includes("addiction")) return "substance-abuse"
      if (area.includes("food") || area.includes("hunger") || area.includes("nutrition")) return "food-security"
      if (area.includes("disability") || area.includes("disabled")) return "disability-support"
      if (area.includes("youth") || area.includes("children") || area.includes("young")) return "youth-services"
      if (area.includes("elderly") || area.includes("senior") || area.includes("aged")) return "elderly-care"
      if (area.includes("crisis") || area.includes("emergency")) return "crisis-support"
    }
    return "other"
  }

  const applyFilters = () => {
    let filtered = [...resources]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (resource) =>
          resource.name.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.category.toLowerCase().includes(query) ||
          resource.location?.toLowerCase().includes(query) ||
          resource.province?.toLowerCase().includes(query),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((resource) => resource.category === selectedCategory)
    }

    // Province filter
    if (selectedProvince !== "All Provinces") {
      filtered = filtered.filter((resource) => resource.province === selectedProvince)
    }

    // Crisis support filter - check if category is crisis-support
    if (showCrisisOnly) {
      filtered = filtered.filter((resource) => resource.category === "crisis-support")
    }

    setFilteredResources(filtered)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)
    try {
      // Upload to Vercel Blob
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      setNewResource((prev) => ({ ...prev, logo_url: url }))
      setLogoPreview(url)

      toast({
        title: "Image uploaded",
        description: "Logo has been uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    }
    setUploadingImage(false)
  }

  const removeImage = () => {
    setNewResource((prev) => ({ ...prev, logo_url: "" }))
    setLogoPreview(null)
  }

  const addResource = async () => {
    if (!user || !newResource.name.trim() || !newResource.category) return

    try {
      const { error } = await supabase.from("professional_resources").insert({
        name: newResource.name.trim(),
        description: newResource.description.trim(),
        category: newResource.category,
        location: newResource.location.trim(),
        province: newResource.province,
        phone_number: newResource.phone_number.trim() || null,
        email: newResource.email.trim() || null,
        website_url: newResource.website_url.trim() || null,
        logo_url: newResource.logo_url || null, // Added logo_url to insert
        contact_info: newResource.contact_info ? { additional: newResource.contact_info } : {},
        is_verified: false,
      })

      if (error) throw error

      toast({
        title: "Resource added!",
        description: "Thank you for contributing to the community resource directory.",
      })

      setNewResource({
        name: "",
        description: "",
        category: "",
        contact_info: "",
        location: "",
        phone_number: "",
        email: "",
        website_url: "",
        province: "",
        is_crisis_support: false,
        logo_url: "", // Reset logo_url
      })
      setLogoPreview(null) // Reset preview
      setAddResourceOpen(false)
      fetchResources()
    } catch (error) {
      console.error("Error adding resource:", error)
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryData = resourceCategories.find((cat) => cat.value === category)
    const IconComponent = categoryData?.icon || Users
    return <IconComponent className="h-4 w-4" />
  }

  const getCategoryLabel = (category: string) => {
    const categoryData = resourceCategories.find((cat) => cat.value === category)
    return categoryData?.label || category
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 shrink-0" />
            <span className="truncate">Community Resources</span>
          </div>
          <div className="flex space-x-2 shrink-0">
            <Button variant="outline" size="sm" onClick={fetchResources} disabled={loading}>
              <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {user && (
              <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Resource</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Community Resource</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Organization Logo</Label>
                      {logoPreview ? (
                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                          <Image
                            src={logoPreview || "/placeholder.svg"}
                            alt="Logo preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              {uploadingImage ? "Uploading..." : "Click to upload logo (Max 5MB)"}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resource-name">Organization Name *</Label>
                        <Input
                          id="resource-name"
                          value={newResource.name}
                          onChange={(e) => setNewResource((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Lifeline South Africa"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resource-category">Category *</Label>
                        <Select
                          value={newResource.category}
                          onValueChange={(value) => setNewResource((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {resourceCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center">
                                  <category.icon className="h-4 w-4 mr-2" />
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resource-description">Description</Label>
                      <Textarea
                        id="resource-description"
                        value={newResource.description}
                        onChange={(e) => setNewResource((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="What services do they provide? Who can they help?"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resource-province">Province</Label>
                        <Select
                          value={newResource.province}
                          onValueChange={(value) => setNewResource((prev) => ({ ...prev, province: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.slice(1).map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resource-location">City/Township</Label>
                        <Input
                          id="resource-location"
                          value={newResource.location}
                          onChange={(e) => setNewResource((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., Cape Town, Soweto"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resource-phone">Phone Number</Label>
                        <Input
                          id="resource-phone"
                          value={newResource.phone_number}
                          onChange={(e) => setNewResource((prev) => ({ ...prev, phone_number: e.target.value }))}
                          placeholder="e.g., 0800 567 567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resource-email">Email</Label>
                        <Input
                          id="resource-email"
                          type="email"
                          value={newResource.email}
                          onChange={(e) => setNewResource((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="contact@organization.org"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resource-website">Website</Label>
                      <Input
                        id="resource-website"
                        value={newResource.website_url}
                        onChange={(e) => setNewResource((prev) => ({ ...prev, website_url: e.target.value }))}
                        placeholder="https://www.organization.org"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resource-contact">Additional Contact Info</Label>
                      <Textarea
                        id="resource-contact"
                        value={newResource.contact_info}
                        onChange={(e) => setNewResource((prev) => ({ ...prev, contact_info: e.target.value }))}
                        placeholder="WhatsApp numbers, operating hours, special instructions..."
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setAddResourceOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addResource} disabled={!newResource.name.trim() || !newResource.category}>
                        Add Resource
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources, organizations, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {resourceCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center">
                      <category.icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
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

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="crisis-only"
                checked={showCrisisOnly}
                onChange={(e) => setShowCrisisOnly(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="crisis-only" className="text-sm">
                Crisis support only
              </Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredResources.length} resources found
            </Badge>
          </div>
        </div>

        {/* Crisis Support Banner */}
        {showCrisisOnly && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <h4 className="font-medium">Crisis Support Resources</h4>
                  <p className="text-sm">
                    If you're in immediate danger, call 10111 (Police) or 10177 (Medical Emergency)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or add a new resource to help the community.
            </p>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedProvince("All Provinces")
                  setShowCrisisOnly(false)
                }}
              >
                Clear Filters
              </Button>
              {user && (
                <Button onClick={() => setAddResourceOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {resource.logo_url && (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border self-start">
                        <Image
                          src={resource.logo_url || "/placeholder.svg"}
                          alt={`${resource.name} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold truncate max-w-full">{resource.name}</h3>
                        {resource.is_verified && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        {getCategoryIcon(resource.category)}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(resource.category)}
                        </Badge>
                        {resource.province && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[80px] sm:max-w-none">{resource.province}</span>
                          </Badge>
                        )}
                      </div>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-sm">
                        {resource.phone_number && (
                          <a
                            href={`tel:${resource.phone_number}`}
                            className="flex items-center text-primary hover:underline"
                          >
                            <Phone className="h-4 w-4 mr-1 shrink-0" />
                            <span className="truncate">{resource.phone_number}</span>
                          </a>
                        )}
                        {resource.email && (
                          <a
                            href={`mailto:${resource.email}`}
                            className="flex items-center text-primary hover:underline max-w-full"
                          >
                            <Mail className="h-4 w-4 mr-1 shrink-0" />
                            <span className="truncate">{resource.email}</span>
                          </a>
                        )}
                        {resource.website_url && (
                          <a
                            href={resource.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            <Globe className="h-4 w-4 mr-1 shrink-0" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
