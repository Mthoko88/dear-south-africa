"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Flag, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Trash2,
  Clock,
  ArrowLeft,
  Shield,
  User,
  FileText
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

// Admin user IDs - in production, store this in database
const ADMIN_USERS = [
  // Add your admin user IDs here
]

interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reported_story_id: string
  report_type: string
  reason: string | null
  status: string
  moderator_notes: string | null
  created_at: string
  resolved_at: string | null
  reporter?: {
    username: string
    full_name: string
  }
  reported_user?: {
    username: string
    full_name: string
  }
  story?: {
    title: string
    content: string
    is_published: boolean
  }
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  spam: "Spam or misleading",
  harassment: "Harassment or bullying",
  hate_speech: "Hate speech or discrimination",
  violence: "Violence or dangerous content",
  sexual_content: "Sexual or inappropriate content",
  privacy: "Privacy violation",
  misinformation: "Misinformation or false claims",
  other: "Other",
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
    case "reviewed":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Eye className="h-3 w-3 mr-1" /> Reviewed</Badge>
    case "resolved":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Resolved</Badge>
    case "dismissed":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><XCircle className="h-3 w-3 mr-1" /> Dismissed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | "delete">("resolve")
  const [moderatorNotes, setModeratorNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Check if user is admin
  const isAdmin = user && (ADMIN_USERS.includes(user.id) || user.email?.endsWith("@dearsa.africa"))

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user, activeTab])

  const fetchReports = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (activeTab !== "all") {
        query = query.eq("status", activeTab)
      }

      const { data, error } = await query

      if (error) throw error

      // Fetch additional data for each report
      if (data && data.length > 0) {
        const enrichedReports = await Promise.all(
          data.map(async (report) => {
            // Fetch reporter profile
            const { data: reporter } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("user_id", report.reporter_id)
              .single()

            // Fetch reported user profile
            const { data: reportedUser } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("user_id", report.reported_user_id)
              .single()

            // Fetch story
            const { data: story } = await supabase
              .from("stories")
              .select("title, content, is_published")
              .eq("id", report.reported_story_id)
              .single()

            return {
              ...report,
              reporter,
              reported_user: reportedUser,
              story,
            }
          })
        )

        setReports(enrichedReports)
      } else {
        setReports([])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedReport || !user) return

    setIsSubmitting(true)
    try {
      if (actionType === "delete") {
        // Delete the story
        const { error: deleteError } = await supabase
          .from("stories")
          .delete()
          .eq("id", selectedReport.reported_story_id)

        if (deleteError) throw deleteError

        // Update report status
        await supabase
          .from("reports")
          .update({
            status: "resolved",
            moderator_id: user.id,
            moderator_notes: moderatorNotes || "Story deleted by moderator",
            resolved_at: new Date().toISOString(),
          })
          .eq("id", selectedReport.id)

        toast({
          title: "Story deleted",
          description: "The reported story has been removed.",
        })
      } else {
        // Update report status
        const { error } = await supabase
          .from("reports")
          .update({
            status: actionType === "resolve" ? "resolved" : "dismissed",
            moderator_id: user.id,
            moderator_notes: moderatorNotes || null,
            resolved_at: new Date().toISOString(),
          })
          .eq("id", selectedReport.id)

        if (error) throw error

        toast({
          title: actionType === "resolve" ? "Report resolved" : "Report dismissed",
          description: actionType === "resolve" 
            ? "The report has been marked as resolved." 
            : "The report has been dismissed.",
        })
      }

      setIsActionDialogOpen(false)
      setSelectedReport(null)
      setModeratorNotes("")
      fetchReports()
    } catch (error) {
      console.error("Error processing report:", error)
      toast({
        title: "Error",
        description: "Failed to process report",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openActionDialog = (report: Report, action: "resolve" | "dismiss" | "delete") => {
    setSelectedReport(report)
    setActionType(action)
    setModeratorNotes("")
    setIsActionDialogOpen(true)
  }

  const pendingCount = reports.filter(r => r.status === "pending").length

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Please sign in to access moderation tools.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Content Moderation</h1>
          </div>
          <p className="text-muted-foreground">
            Review and manage reported content to keep the community safe.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reports.filter(r => r.status === "pending").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.status === "resolved").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dismissed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {reports.filter(r => r.status === "dismissed").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <Flag className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Review reported stories and take appropriate action</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading reports...
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8">
                    <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No reports found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <Card key={report.id} className="border-l-4 border-l-yellow-400">
                          <CardContent className="pt-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {getStatusBadge(report.status)}
                                  <Badge variant="outline" className="bg-red-50 text-red-700">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(report.created_at))} ago
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground flex items-center gap-1">
                                      <User className="h-3 w-3" /> Reported by:
                                    </p>
                                    <p className="font-medium">
                                      {report.reporter?.full_name || report.reporter?.username || "Unknown"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground flex items-center gap-1">
                                      <User className="h-3 w-3" /> Story author:
                                    </p>
                                    <p className="font-medium">
                                      {report.reported_user?.full_name || report.reported_user?.username || "Unknown"}
                                    </p>
                                  </div>
                                </div>

                                {report.story && (
                                  <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                                      <FileText className="h-3 w-3" /> Reported story:
                                    </p>
                                    <p className="font-medium">{report.story.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                      {report.story.content}
                                    </p>
                                    {!report.story.is_published && (
                                      <Badge variant="outline" className="mt-2 text-xs">
                                        Story unpublished
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {report.reason && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Additional details:</p>
                                    <p className="text-sm bg-muted p-2 rounded mt-1">{report.reason}</p>
                                  </div>
                                )}

                                {report.moderator_notes && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Moderator notes:</p>
                                    <p className="text-sm bg-blue-50 p-2 rounded mt-1">{report.moderator_notes}</p>
                                  </div>
                                )}
                              </div>

                              {report.status === "pending" && (
                                <div className="flex flex-row md:flex-col gap-2">
                                  <Link href={`/story/${report.reported_story_id}`} target="_blank">
                                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </Link>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openActionDialog(report, "resolve")}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Resolve
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openActionDialog(report, "dismiss")}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Dismiss
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openActionDialog(report, "delete")}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "resolve" && "Resolve Report"}
              {actionType === "dismiss" && "Dismiss Report"}
              {actionType === "delete" && "Delete Story"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "resolve" && "Mark this report as resolved. The story will remain published."}
              {actionType === "dismiss" && "Dismiss this report as invalid or not violating community guidelines."}
              {actionType === "delete" && "This will permanently delete the reported story. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Moderator notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this decision..."
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={isSubmitting}
              variant={actionType === "delete" ? "destructive" : "default"}
            >
              {isSubmitting ? "Processing..." : (
                <>
                  {actionType === "resolve" && "Resolve"}
                  {actionType === "dismiss" && "Dismiss"}
                  {actionType === "delete" && "Delete Story"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
