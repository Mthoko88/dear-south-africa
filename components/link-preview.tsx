"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Link2, ExternalLink, FileText, Loader2, AlertCircle, Check, ChevronDown, ChevronUp, Building2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExtractedData {
  metadata: {
    title: string
    description: string | null
    image: string | null
    siteName: string
    author: string | null
    publishedDate: string | null
    url: string
  }
  article: {
    content: string | null
    textContent: string | null
    wordCount: number
  }
}

interface LinkPreviewProps {
  open: boolean
  onClose: () => void
  onImportMetadata: (data: { title: string; description: string; image: string | null; sourceUrl: string }) => void
  onImportFullArticle: (data: { title: string; content: string; image: string | null; sourceUrl: string }) => void
}

export function LinkPreview({ open, onClose, onImportMetadata, onImportFullArticle }: LinkPreviewProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFullContent, setShowFullContent] = useState(false)
  const { toast } = useToast()

  const handleExtract = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL to extract content from.",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    let validUrl = url.trim()
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl
    }

    setLoading(true)
    setError(null)
    setExtractedData(null)

    try {
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: validUrl }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to extract content"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // Response wasn't JSON
          if (errorText.includes("<!DOCTYPE")) {
            errorMessage = "Unable to reach the extraction service. Please try again."
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setExtractedData(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract content"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleImportPreview = () => {
    if (!extractedData) return
    
    onImportMetadata({
      title: extractedData.metadata.title,
      description: extractedData.metadata.description || "",
      image: extractedData.metadata.image,
      sourceUrl: extractedData.metadata.url,
    })
    resetState()
  }

  const handleImportFull = () => {
    if (!extractedData?.article.content) return
    
    onImportFullArticle({
      title: extractedData.metadata.title,
      content: extractedData.article.content,
      image: extractedData.metadata.image,
      sourceUrl: extractedData.metadata.url,
    })
    resetState()
  }

  const resetState = () => {
    setUrl("")
    setExtractedData(null)
    setError(null)
    setShowFullContent(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Import from Link</DialogTitle>
              <DialogDescription>
                Share an article from another platform with your community
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* URL Input Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Paste Article URL</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com/article..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleExtract} 
                disabled={loading || !url.trim()}
                className="h-11 px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  "Extract"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the URL of an article you want to share. We&apos;ll extract the title, image, and content.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="border-dashed">
              <CardContent className="p-6">
                <div className="flex gap-5">
                  <Skeleton className="h-28 w-28 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">Failed to extract content</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <p className="text-sm text-muted-foreground">
                      Make sure the URL is correct and the website is publicly accessible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Card */}
          {extractedData && !loading && (
            <div className="space-y-5">
              <Card>
                <CardContent className="p-5">
                  <div className="flex gap-5">
                    {/* Image */}
                    {extractedData.metadata.image && (
                      <div className="shrink-0">
                        <img
                          src={extractedData.metadata.image}
                          alt=""
                          className="h-28 w-28 md:h-36 md:w-36 object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-lg leading-snug line-clamp-2">
                          {extractedData.metadata.title}
                        </h3>
                        <a
                          href={extractedData.metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </div>
                      
                      {extractedData.metadata.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {extractedData.metadata.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {extractedData.metadata.siteName}
                        </Badge>
                        {extractedData.metadata.author && (
                          <span>by {extractedData.metadata.author}</span>
                        )}
                        {extractedData.metadata.publishedDate && (
                          <span>{formatDate(extractedData.metadata.publishedDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Article stats */}
                  {extractedData.article.wordCount > 0 && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>
                          {extractedData.article.wordCount.toLocaleString()} words extracted
                        </span>
                      </div>
                      
                      {extractedData.article.textContent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullContent(!showFullContent)}
                        >
                          {showFullContent ? (
                            <>
                              <ChevronUp className="mr-1 h-4 w-4" />
                              Hide Preview
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-1 h-4 w-4" />
                              Preview Content
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Full content preview */}
                  {showFullContent && extractedData.article.textContent && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg max-h-52 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {extractedData.article.textContent.slice(0, 2000)}
                        {extractedData.article.textContent.length > 2000 && "..."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={handleImportPreview}
                  variant="outline"
                  className="h-auto py-4"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Use Title & Summary</span>
                    <span className="text-xs text-muted-foreground font-normal">Quick share with basic info</span>
                  </div>
                </Button>
                
                {extractedData.article.content && (
                  <Button 
                    onClick={handleImportFull}
                    className="h-auto py-4"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Import Full Article</span>
                      <span className="text-xs opacity-80 font-normal">Edit before sharing</span>
                    </div>
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground text-center px-4">
                The original source will be credited with a link back to the article.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button variant="ghost" onClick={handleClose} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {!extractedData && !loading && (
              <p className="text-xs text-muted-foreground">
                Supported: News articles, blogs, and most public web pages
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
