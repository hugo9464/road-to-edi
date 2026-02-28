import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 })
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const translated: string | undefined = data?.responseData?.translatedText
    if (!translated || data?.responseStatus !== 200) throw new Error('No translation')
    return NextResponse.json({ translated })
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
