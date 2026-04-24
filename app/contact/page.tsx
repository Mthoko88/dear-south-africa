import { ArrowLeft, Mail, MapPin, Phone, Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

export default function ContactPage() {
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
            <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Get in touch with the Dear South Africa team. We're here to help and listen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Zebra Digital Media (Pty) Ltd</h3>
                  <p className="text-sm text-muted-foreground">Registration: 2024/098409/07</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Registered Office</p>
                    <p className="text-sm text-muted-foreground">
                      Unit 23 Monterrey
                      <br />
                      Troupant Avenue, Magaliessig
                      <br />
                      Johannesburg, Gauteng
                      <br />
                      2191, South Africa
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Get in Touch
                </CardTitle>
                <CardDescription>We'd love to hear from you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href="mailto:info@dearsouthafrica.com" className="text-sm text-primary hover:underline">
                      info@dearsouthafrica.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Support Line</p>
                    <p className="text-sm text-muted-foreground">Available Monday - Friday, 9am - 5pm SAST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About Dear South Africa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Dear South Africa is a storytelling platform dedicated to amplifying the voices of ordinary South
                Africans. We believe that every story matters, and through sharing our experiences, we can heal, learn,
                and connect with one another.
              </p>
              <p>
                Our platform provides a safe space for South Africans to share their personal experiences, challenges,
                triumphs, and perspectives across various categories including family, health, relationships, social
                issues, and more.
              </p>
              <p>
                Whether you choose to share your story publicly, anonymously, or keep it private in your personal diary,
                Dear South Africa is here to listen and provide a supportive community.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
