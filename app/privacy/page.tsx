import { ArrowLeft, Shield, AlertTriangle, Users, Eye, Lock, FileText, Scale, Mail, Database, Globe } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">Privacy Policy & POPIA Compliance</h1>
            <p className="text-muted-foreground">Last updated: April 2026</p>
            <p className="text-sm mt-2 p-3 bg-primary/10 rounded-lg">
              This policy complies with the Protection of Personal Information Act 4 of 2013 (POPIA) of South Africa.
            </p>
          </div>

          <div className="space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  About Dear South Africa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Dear South Africa is a digital storytelling platform operated by <strong>Zebra Digital Media (Pty) Ltd</strong>
                  (Registration: 2024/098409/07). Our mission is to provide a safe, supportive space where ordinary
                  South Africans can share their personal stories, experiences, and perspectives.
                </p>
                <p>
                  We believe that by sharing our stories, we can help others feel less alone, promote healing through
                  connection, and build understanding across our diverse communities.
                </p>
              </CardContent>
            </Card>

            {/* POPIA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  POPIA Compliance Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  In accordance with the Protection of Personal Information Act (POPIA), we are committed to protecting 
                  your personal information and ensuring that it is processed lawfully, fairly, and transparently.
                </p>
                <h3 className="font-semibold mt-4">Your Rights Under POPIA</h3>
                <p>As a data subject, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information we hold</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Object:</strong> Object to the processing of your personal information</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent previously given for processing</li>
                  <li><strong>Complain:</strong> Lodge a complaint with the Information Regulator</li>
                </ul>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-semibold">Information Officer:</p>
                  <p>Thokozisi Dube</p>
                  <p>Email: info@dearsa.africa</p>
                  <p>Address: Unit 23 Monterrey, Troupant Avenue, Magaliessig, Johannesburg, Gauteng, 2191</p>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <h3 className="font-semibold">Personal Information Collected</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Email address, username, password (encrypted), profile details</li>
                  <li><strong>Profile Information:</strong> Full name, avatar/profile picture, bio, location (optional)</li>
                  <li><strong>Content:</strong> Stories, comments, diary entries, and other content you create</li>
                  <li><strong>Interactions:</strong> Likes, bookmarks, follows, and community engagement</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
                  <li><strong>Optional Demographics:</strong> Age range, gender, ethnicity (voluntarily provided)</li>
                </ul>

                <h3 className="font-semibold mt-4">Special Personal Information</h3>
                <p>
                  Due to the nature of our storytelling platform, you may choose to share sensitive information 
                  in your stories (health conditions, religious beliefs, political views, etc.). This is entirely 
                  voluntary, and you control what you share. We recommend using anonymous posting for sensitive content.
                </p>
              </CardContent>
            </Card>

            {/* Purpose of Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Purpose of Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>We process your personal information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Delivery:</strong> To provide and maintain our storytelling platform</li>
                  <li><strong>Account Management:</strong> To create and manage your account</li>
                  <li><strong>Communication:</strong> To send important updates, respond to inquiries, and provide support</li>
                  <li><strong>Safety & Security:</strong> To maintain platform safety, prevent abuse, and enforce our terms</li>
                  <li><strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations</li>
                </ul>

                <h3 className="font-semibold mt-4">Marketing Communications</h3>
                <p>
                  We will only send you marketing communications (newsletters, promotional content) if you have 
                  explicitly opted in. You can withdraw consent at any time through your account settings or by 
                  clicking &quot;unsubscribe&quot; in any email.
                </p>
              </CardContent>
            </Card>

            {/* Consent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Consent & Legal Basis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>We process your information based on the following legal grounds:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Consent:</strong> When you create an account and agree to our terms</li>
                  <li><strong>Contract:</strong> To fulfill our service agreement with you</li>
                  <li><strong>Legitimate Interest:</strong> To improve our services and ensure security</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
                </ul>

                <h3 className="font-semibold mt-4">Withdrawing Consent</h3>
                <p>
                  You can withdraw your consent at any time by contacting us at info@dearsa.africa or through 
                  your account settings. Note that withdrawal of consent does not affect the lawfulness of 
                  processing based on consent before its withdrawal.
                </p>
              </CardContent>
            </Card>

            {/* Content Warnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Content Warnings & Reader Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  We take reader safety seriously. Stories containing sensitive content are marked with appropriate
                  content warnings including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violence or abuse</li>
                  <li>Mental health challenges</li>
                  <li>Substance use</li>
                  <li>Death or loss</li>
                  <li>Discrimination or trauma</li>
                  <li>Medical or health-related content</li>
                </ul>
              </CardContent>
            </Card>

            {/* Age Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Age Requirements & Child Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="font-semibold text-destructive">
                  Age Requirement: Users must be 18 years or older to use Dear South Africa.
                </p>
                <p>
                  We do not knowingly collect personal information from children under 18. If you believe a minor 
                  has created an account, please contact us immediately at info@dearsa.africa.
                </p>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Data Sharing & Third Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Hosting, analytics, and email services that help operate our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
                <p className="mt-4">
                  We do <strong>not</strong> sell your personal information to third parties for marketing purposes.
                </p>

                <h3 className="font-semibold mt-4">Cross-Border Transfers</h3>
                <p>
                  Some of our service providers may be located outside South Africa. We ensure appropriate 
                  safeguards are in place when transferring data internationally, in compliance with POPIA.
                </p>
              </CardContent>
            </Card>

            {/* Privacy Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Privacy Options & Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>You control how your content is shared:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Public Stories:</strong> Shared with your username, visible to all</li>
                  <li><strong>Anonymous Stories:</strong> Shared publicly without identifying information</li>
                  <li><strong>Draft Stories:</strong> Saved privately until you publish</li>
                  <li><strong>Diary Entries:</strong> Completely private, never visible to others</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>We implement appropriate security measures including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encrypted connections (HTTPS/TLS)</li>
                  <li>Secure password hashing</li>
                  <li>Database encryption</li>
                  <li>Regular security audits</li>
                  <li>Access controls and authentication</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  We retain your personal information for as long as your account is active or as needed to 
                  provide services. When you delete your account:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your profile and private data are deleted within 30 days</li>
                  <li>Public stories may be anonymized rather than deleted (to preserve community discussions)</li>
                  <li>Some data may be retained for legal compliance or legitimate business purposes</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Cookies & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>We use cookies for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Necessary Cookies:</strong> Essential for website functionality and security</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (with consent)</li>
                  <li><strong>Marketing Cookies:</strong> Used for personalized content (with consent)</li>
                </ul>
                <p className="mt-4">
                  You can manage your cookie preferences at any time through our cookie settings banner or 
                  your browser settings.
                </p>
              </CardContent>
            </Card>

            {/* Contact & Complaints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Us & Complaints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>For privacy-related inquiries or to exercise your POPIA rights:</p>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p><strong>Information Officer:</strong> Thokozisi Dube</p>
                  <p><strong>Email:</strong> info@dearsa.africa</p>
                  <p><strong>Address:</strong> Unit 23 Monterrey, Troupant Avenue, Magaliessig, Johannesburg, Gauteng, 2191</p>
                </div>

                <Separator className="my-4" />

                <p>If you are not satisfied with our response, you may lodge a complaint with:</p>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p><strong>The Information Regulator (South Africa)</strong></p>
                  <p>Email: inforeg@justice.gov.za</p>
                  <p>Website: www.justice.gov.za/inforeg</p>
                  <p>Tel: 012 406 4818</p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  We may update this privacy policy from time to time. Significant changes will be communicated 
                  to users via email or platform notification. Continued use of Dear South Africa after changes 
                  indicates acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
