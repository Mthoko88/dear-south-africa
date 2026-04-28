import { NextRequest, NextResponse } from "next/server"

// Simple HTML parser using regex (works in serverless)
function extractMetaContent(html: string, selectors: string[]): string | null {
  for (const selector of selectors) {
    // Handle meta tags with property or name
    if (selector.includes('property="') || selector.includes('name="')) {
      const attrMatch = selector.match(/(property|name)="([^"]+)"/)
      if (attrMatch) {
        const [, attrType, attrValue] = attrMatch
        const regex = new RegExp(`<meta[^>]*${attrType}=["']${attrValue}["'][^>]*content=["']([^"']+)["']`, 'i')
        const altRegex = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attrType}=["']${attrValue}["']`, 'i')
        
        const match = html.match(regex) || html.match(altRegex)
        if (match?.[1]) return match[1].trim()
      }
    }
    
    // Handle title tag
    if (selector === 'title') {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (match?.[1]) return match[1].trim()
    }
  }
  return null
}

function extractArticleContent(html: string): { content: string; textContent: string } | null {
  try {
    // Remove script and style tags
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
    
    // Try to find article or main content
    let articleMatch = cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (!articleMatch) {
      articleMatch = cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    }
    if (!articleMatch) {
      // Try to find content by class name patterns
      articleMatch = cleanHtml.match(/<div[^>]*class="[^"]*(?:article|content|post|entry)[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    }
    
    const content = articleMatch?.[1] || ""
    
    // Extract plain text
    const textContent = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (textContent.length < 100) return null
    
    return { content, textContent }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the page
    let response: Response
    try {
      response = await fetch(validUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(15000),
      })
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json(
        { error: "Could not reach the website. Please check the URL and try again." },
        { status: 400 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Website returned an error: ${response.status}` },
        { status: 400 }
      )
    }

    const html = await response.text()

    // Extract metadata
    const metadata = {
      title: extractMetaContent(html, [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
        'title',
      ]) || "Untitled",
      
      description: extractMetaContent(html, [
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
      ]),
      
      image: extractMetaContent(html, [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'meta[name="twitter:image:src"]',
      ]),
      
      siteName: extractMetaContent(html, [
        'meta[property="og:site_name"]',
      ]) || validUrl.hostname,
      
      author: extractMetaContent(html, [
        'meta[name="author"]',
        'meta[property="article:author"]',
      ]),
      
      publishedDate: extractMetaContent(html, [
        'meta[property="article:published_time"]',
        'meta[name="date"]',
      ]),
      
      url: validUrl.toString(),
    }

    // Make image URL absolute if relative
    if (metadata.image && !metadata.image.startsWith("http")) {
      try {
        metadata.image = new URL(metadata.image, validUrl.toString()).toString()
      } catch {
        metadata.image = null
      }
    }

    // Extract article content
    const article = extractArticleContent(html)

    return NextResponse.json({
      metadata,
      article: article ? {
        content: article.content,
        textContent: article.textContent,
        wordCount: article.textContent.split(/\s+/).filter(Boolean).length,
      } : {
        content: null,
        textContent: null,
        wordCount: 0,
      },
    })
  } catch (error) {
    console.error("URL extraction error:", error)
    return NextResponse.json(
      { error: "Failed to extract content from URL. The website may be blocking access." },
      { status: 500 }
    )
  }
}
