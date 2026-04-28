"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during the authentication process. This could happen if:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>There was a problem connecting to the authentication service</li>
          </ul>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/?auth=signin">Try Signing In Again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
