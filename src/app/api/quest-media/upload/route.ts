import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const payload = await getPayload({ config })
    
    // Create the media file
    const media = await payload.create({
      collection: 'quest-media',
      data: {
        title: title || file.name,
        alt: title || file.name,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    })
    
    return NextResponse.json({
      id: media.id,
      url: media.url,
      filename: media.filename,
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload media', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
