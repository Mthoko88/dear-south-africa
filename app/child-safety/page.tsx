import {
  ArrowLeft,
  ShieldAlert,
  Ban,
  Flag,
  Scale,
  Mail,
  Users,
  Phone,
  Globe,
  FileText,
} from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Child Safety Standards | Dear South Africa",
  description:
    "Dear South Africa's standards against child sexual abuse and exploitation (CSAE), including our zero-tolerance policy, reporting mechanisms, legal compliance, and point of contact.",
}

export default function ChildSafetyPage() {
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
            <h1 className="text-4xl font-bold mb-3 text-balance">Child Safety Standards</h1>
            <p className="text-muted-foreground">Last updated: April 2026</p>
            <p className="text-sm mt-2 p-3 bg-primary/10 rounded-lg text-pretty">
              These standards describe how Dear South Africa prevents, detects, and responds to child sexual abuse and
              exploitation (CSAE) and child sexual abuse material (CSAM). They apply to everyone who uses our platform.
            </p>
          </div>

          <div className="space-y-6">
            {/* Zero Tolerance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Our Zero-Tolerance Commitment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Dear South Africa, operated by <strong>Zebra Digital Media (Pty) Ltd</strong> (Registration:
                  2024/098409/07), has a <strong>zero-tolerance policy</strong> toward child sexual abuse and
                  exploitation (CSAE) and child sexual abuse material (CSAM). We are committed to preventing our
                  platform from being used to create, store, share, promote, or facilitate any form of child
                  exploitation.
                </p>
                <p>
                  Dear South Africa is an <strong>adults-only (18+) storytelling platform</strong>. We do not knowingly
                  allow anyone under the age of 18 to create an account or use our services. Content that sexualizes,
                  endangers, or exploits minors is strictly prohibited and will be removed, reported to the relevant
                  authorities, and result in immediate and permanent account termination.
                </p>
              </CardContent>
            </Card>

            {/* Prohibited Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Prohibited Content and Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>The following are strictly prohibited on Dear South Africa:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Child sexual abuse material (CSAM) in any form, whether real, animated, or AI-generated</li>
                  <li>Sexualization or sexual depiction of any person under the age of 18</li>
                  <li>Grooming, solicitation, or any attempt to sexually exploit a minor</li>
                  <li>Sextortion or the threat to share intimate imagery of a minor</li>
                  <li>Trafficking, endangerment, or facilitation of harm to children</li>
                  <li>Sharing links, contact details, or resources that promote or provide access to CSAE/CSAM</li>
                  <li>Any content that normalizes, promotes, or glorifies the sexual abuse of children</li>
                </ul>
                <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                  <p className="font-semibold text-destructive">
                    Violations result in immediate content removal, account termination, preservation of evidence, and
                    reporting to law enforcement and relevant child-protection organizations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reporting Mechanism */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  How to Report CSAE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  We provide an <strong>in-app reporting mechanism</strong> on every story and comment. If you encounter
                  content that may involve the abuse or exploitation of a child, report it immediately:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Use the <strong>&quot;Report&quot;</strong> button available on any story, comment, or profile
                  </li>
                  <li>
                    Email our child safety team directly at{" "}
                    <a href="mailto:safety@dearsa.africa" className="text-primary hover:underline">
                      safety@dearsa.africa
                    </a>
                  </li>
                </ul>
                <p>
                  All reports of suspected CSAE are treated as our <strong>highest priority</strong>. We review them
                  urgently, remove violating content, preserve evidence, and escalate to the appropriate authorities.
                </p>
              </CardContent>
            </Card>

            {/* How We Respond */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  How We Respond to Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>When we receive a report or detect suspected CSAE, we:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remove the offending content as quickly as possible</li>
                  <li>Suspend and permanently terminate the responsible account(s)</li>
                  <li>Preserve relevant data and evidence to assist investigations</li>
                  <li>
                    Report confirmed CSAM to the relevant authorities and child-protection bodies, including the
                    National Center for Missing &amp; Exploited Children (NCMEC) and South African law enforcement
                  </li>
                  <li>Cooperate fully with lawful requests from law enforcement</li>
                </ul>
              </CardContent>
            </Card>

            {/* Legal Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Compliance With Child Safety Laws
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  We comply with all applicable child safety and child-protection laws in the jurisdictions where we
                  operate, including South Africa. Relevant legislation includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The Films and Publications Act 65 of 1996 (as amended)</li>
                  <li>The Children&apos;s Act 38 of 2005</li>
                  <li>The Criminal Law (Sexual Offences and Related Matters) Amendment Act 32 of 2007</li>
                  <li>The Cybercrimes Act 19 of 2020</li>
                  <li>The Protection of Personal Information Act 4 of 2013 (POPIA)</li>
                </ul>
                <p>
                  Where required by law, we report child sexual abuse material and related offences to the designated
                  authorities without delay.
                </p>
              </CardContent>
            </Card>

            {/* Point of Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Child Safety Point of Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  We maintain a dedicated point of contact for child safety matters, available to users, regulators,
                  and law enforcement:
                </p>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p>
                    <strong>Child Safety Officer:</strong> Thokozisi Dube
                  </p>
                  <p>
                    <strong>Child Safety Email:</strong>{" "}
                    <a href="mailto:safety@dearsa.africa" className="text-primary hover:underline">
                      safety@dearsa.africa
                    </a>
                  </p>
                  <p>
                    <strong>Address:</strong> Unit 23 Monterrey, Troupant Avenue, Magaliessig, Johannesburg, Gauteng,
                    2191
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* External Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  External Reporting Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  If a child is in immediate danger, contact your local emergency services first. You can also report
                  child exploitation directly to these organizations:
                </p>
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div>
                    <p className="font-semibold">South African Police Service (SAPS)</p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Emergency: 10111
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Childline South Africa</p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> 116 (toll-free)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">The Film and Publication Board (FPB) Hotline</p>
                    <p>Report harmful online content, including CSAM</p>
                  </div>
                  <div>
                    <p className="font-semibold">National Center for Missing &amp; Exploited Children (NCMEC)</p>
                    <p>CyberTipline: report.cybertip.org</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Changes to These Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  We review and update these Child Safety Standards regularly to reflect evolving best practices, legal
                  requirements, and platform features. Continued use of Dear South Africa after changes indicates
                  acceptance of the updated standards.
                </p>
                <Separator className="my-4" />
                <p>
                  For our full data-protection practices, please also read our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy &amp; POPIA Compliance
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
