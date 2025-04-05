import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const imageAlt = formData.get('imageAlt') as string
    const userTypesString = formData.get('userTypes') as string
    const userTypes = userTypesString ? JSON.parse(userTypesString) : []
    const imageFile = formData.get('image') as File

    if (!name || !imageFile) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if the mock page exists
    try {
      await payload.findByID({
        collection: 'mock-pages',
        id: params.id,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Mock page not found' }, { status: 404 })
    }

    // Convert the file to a buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the image to Payload
    const uploadedMedia = await payload.create({
      collection: 'media',
      data: {
        alt: imageAlt,
      },
      file: {
        data: buffer,
        mimetype: imageFile.type,
        name: imageFile.name,
        size: imageFile.size,
      },
    })

    // Create a new block object
    const newBlock = {
      name,
      userTypes,
      image: uploadedMedia.id,
    }

    // Get the current mock page
    const mockPage = await payload.findByID({
      collection: 'mock-pages',
      id: params.id,
    })

    // Add the new block to the mock page
    const updatedPage = await payload.update({
      collection: 'mock-pages',
      id: params.id,
      data: {
        blocks: [...(mockPage.blocks || []), newBlock],
      },
    })

    // Get the updated block with proper image URL
    const updatedMockPage = await payload.findByID({
      collection: 'mock-pages',
      id: params.id,
      depth: 2, // Populate the image field
    })

    // Get the newly added block (the last one in the array)
    const blocks = updatedMockPage.blocks || []
    const addedBlock = blocks[blocks.length - 1]

    // Populate the image URL if it's just an ID
    if (addedBlock && addedBlock.image && typeof addedBlock.image === 'string') {
      try {
        const media = await payload.findByID({
          collection: 'media',
          id: addedBlock.image,
        })
        addedBlock.image = media
      } catch (error) {
        console.error('Error fetching image:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Block created successfully',
      block: addedBlock,
    })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      {
        error: 'Failed to create block',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
