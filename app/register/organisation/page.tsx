"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Building2, Upload, Loader2, CheckCircle } from "lucide-react"

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

export default function OrganisationRegistrationPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
    agreed_to_terms: false,
  })

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
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to register an organisation.",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreed_to_terms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
let logoUrl = null
  
  // Upload logo if provided via API route
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

      // Create organisation
      const { data: org, error: orgError } = await supabase
        .from("organisations")
        .insert({
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
          focus_areas: formData.focus_areas,
          beneficiary_demographics: formData.beneficiary_demographics ? { description: formData.beneficiary_demographics } : null,
          facebook_url: formData.facebook_url || null,
          instagram_url: formData.instagram_url || null,
          twitter_url: formData.twitter_url || null,
          linkedin_url: formData.linkedin_url || null,
          user_id: user.id,
          is_verified: false,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Update user profile to link to organisation
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          account_type: "organisation",
          organisation_id: org.id,
          is_admin: true, // Creator is admin of their org
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      toast({
        title: "Organisation registered!",
        description: "Your organisation has been registered successfully. It will be reviewed by our team.",
      })

      router.push(`/organisation/${org.id}`)
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to be signed in to register an organisation. Please sign in or create an account first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go to Home & Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Register Your Organisation</CardTitle>
                <CardDescription>
                  Join Dear South Africa as an NGO, NPO, or community organisation
                </CardDescription>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-6">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of 4: {step === 1 ? "Basic Information" : step === 2 ? "Contact Details" : step === 3 ? "Focus & Impact" : "Review & Submit"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="trading_name">Trading Name *</Label>
                    <Input
                      id="trading_name"
                      value={formData.trading_name}
                      onChange={(e) => setFormData({ ...formData, trading_name: e.target.value })}
                      placeholder="e.g., Hope Foundation SA"
                      required
                    />
                    <p className="text-xs text-muted-foreground">The name your organisation is commonly known as</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registered_name">Registered Name (optional)</Label>
                    <Input
                      id="registered_name"
                      value={formData.registered_name}
                      onChange={(e) => setFormData({ ...formData, registered_name: e.target.value })}
                      placeholder="e.g., Hope Foundation South Africa NPC"
                    />
                    <p className="text-xs text-muted-foreground">Official registered name if different from trading name</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Organisation Type *</Label>
                    <Select
                      value={formData.organisation_type}
                      onValueChange={(value) => setFormData({ ...formData, organisation_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organisation type" />
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
                    <Label htmlFor="registration_number">Registration Number (NPO/PBO)</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      placeholder="e.g., NPO-123-456"
                    />
                    <p className="text-xs text-muted-foreground">Optional but helps with verification</p>
                  </div>



                  <div className="space-y-2">
                    <Label htmlFor="description">About Your Organisation *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us about your organisation, what you do, and who you serve..."
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
                      placeholder="Your organisation's mission..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Organisation Logo</Label>
                    <div className="flex items-center gap-4">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-20 h-20 object-contain rounded-lg border"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                            </span>
                          </Button>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={!formData.trading_name || !formData.organisation_type || !formData.description}
                  >
                    Continue to Contact Details
                  </Button>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Organisation Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@organisation.org"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., 011 123 4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.yourorganisation.org"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="physical_address">Physical Address</Label>
                    <Input
                      id="physical_address"
                      value={formData.physical_address}
                      onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g., Johannesburg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Select
                        value={formData.province}
                        onValueChange={(value) => setFormData({ ...formData, province: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
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

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Social Media (Optional)</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="facebook_url">Facebook</Label>
                        <Input
                          id="facebook_url"
                          value={formData.facebook_url}
                          onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram_url">Instagram</Label>
                        <Input
                          id="instagram_url"
                          value={formData.instagram_url}
                          onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                          placeholder="https://instagram.com/yourhandle"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter_url">X (Twitter)</Label>
                        <Input
                          id="twitter_url"
                          value={formData.twitter_url}
                          onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                          placeholder="https://x.com/yourhandle"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn</Label>
                        <Input
                          id="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/company/yourorg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setStep(3)}
                      disabled={!formData.email}
                    >
                      Continue to Focus & Impact
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Focus & Impact */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Focus Areas *</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select all that apply to your organisation</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {FOCUS_AREAS.map((area) => (
                        <div
                          key={area}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.focus_areas.includes(area)
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleFocusAreaToggle(area)}
                        >
                          <Checkbox
                            checked={formData.focus_areas.includes(area)}
                            onCheckedChange={() => handleFocusAreaToggle(area)}
                          />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="beneficiary_demographics">Who Do You Serve?</Label>
                    <Textarea
                      id="beneficiary_demographics"
                      value={formData.beneficiary_demographics}
                      onChange={(e) => setFormData({ ...formData, beneficiary_demographics: e.target.value })}
                      placeholder="Describe the communities, demographics, or groups your organisation serves..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setStep(4)}
                      disabled={formData.focus_areas.length === 0}
                    >
                      Review & Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Review Your Information</h3>
                    
                    <div className="grid gap-4 text-sm">
                      <div className="flex items-start gap-3">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded" />
                        ) : (
                          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-base">{formData.trading_name}</p>
                          <p className="text-muted-foreground">
                            {ORGANISATION_TYPES.find(t => t.value === formData.organisation_type)?.label}
                          </p>
                          {formData.registration_number && (
                            <p className="text-muted-foreground">Reg: {formData.registration_number}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium">About</p>
                        <p className="text-muted-foreground">{formData.description}</p>
                      </div>

                      <div>
                        <p className="font-medium">Contact</p>
                        <p className="text-muted-foreground">{formData.email}</p>
                        {formData.phone && <p className="text-muted-foreground">{formData.phone}</p>}
                        {formData.city && formData.province && (
                          <p className="text-muted-foreground">{formData.city}, {formData.province}</p>
                        )}
                      </div>

                      <div>
                        <p className="font-medium">Focus Areas</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.focus_areas.map((area) => (
                            <span key={area} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={formData.agreed_to_terms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, agreed_to_terms: checked as boolean })
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="terms" className="cursor-pointer">
                        I agree to the Terms of Service and Privacy Policy
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        By registering, you confirm that you are authorised to represent this organisation 
                        and agree to Dear South Africa&apos;s community guidelines.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading || !formData.agreed_to_terms}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete Registration
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
