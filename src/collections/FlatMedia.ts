import { Media } from '@/payload-types'
import type { FlatMedia as FlatMediaType } from '@/payload-types'
import type { CollectionConfig } from 'payload'
import sharp from 'sharp'
import axios from 'axios'

export const FlatMedia: CollectionConfig = {
  slug: 'flat-media',
  admin: {
    useAsTitle: 'title',
  },
  endpoints: [
    {
      path: '/:id/:slug',
      method: 'get',
      handler: async (req) => {
        if (!req.routeParams)
          return new Response(
            JSON.stringify({
              message: 'Route params not found',
            }),
            { status: 404 },
          )

        const { id, slug } = req.routeParams
        console.log('id: ', id)
        console.log('slug: ', slug)

        const flatMedia: FlatMediaType = await req.payload.findByID({
          collection: 'flat-media',
          id: id as string,
        })

        console.log('flatMedia: ', flatMedia)

        if (!flatMedia.backgroundImage) {
          return new Response(
            JSON.stringify({
              message: 'Background image not found',
            }),
            { status: 404 },
          )
        }

        const backgroundImage: Media = await req.payload.findByID({
          collection: 'media',
          id: (flatMedia.backgroundImage as Media).id,
        })
        const { focalX, focalY } = backgroundImage

        console.log('backgroundImage: ', backgroundImage)

        const foregroundImage: Media = await req.payload.findByID({
          collection: 'media',
          id: (
            (flatMedia.Variation || []).find((variation) => variation.slug === slug)
              ?.foregroundImage as Media
          ).id,
        })

        // get image buffer of backgroundImage and return
        const backgroundImageRes = await axios.get(`http://localhost:3000${backgroundImage.url}`, {
          responseType: 'arraybuffer',
        })
        // const { width, height } = foregroundImage

        // apply https://cdn1.iconfinder.com/data/icons/material-design-icons-light/24/shape-circle-512.png ontop of my background image using payload sharp
        const foregroundImageRes = await axios.get(`http://localhost:3000${foregroundImage.url}`, {
          responseType: 'arraybuffer',
        })

        if (
          !backgroundImage.width ||
          !backgroundImage.height ||
          !foregroundImage.width ||
          !foregroundImage.height
        ) {
          return new Response(
            JSON.stringify({
              message: 'Image dimensions not found',
            }),
            { status: 404 },
          )
        }

        if (!focalX || !focalY) {
          return new Response(JSON.stringify({ message: 'Focal point not found' }), { status: 404 })
        }

        const top = Math.floor(backgroundImage.height * (focalY / 100) - foregroundImage.height / 2)
        const left = Math.floor(backgroundImage.width * (focalX / 100) - foregroundImage.width / 2)

        console.log('top: ', top)
        console.log('left: ', left)

        const output = await sharp(backgroundImageRes.data, { animated: true })
          // .resize(backgroundImage.width, backgroundImage.height * (3 / 4))
          .composite([
            {
              input: foregroundImageRes.data,
              top,
              left,
              gravity: 'center',
            },
          ])
          .toBuffer()

        return new Response(output, {
          headers: {
            'Content-Type': 'image/jpeg', // Adjust the MIME type accordingly if different
          },
        })
      },
    },
  ],
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'Variation',
      type: 'array',
      fields: [
        {
          name: 'slug',
          type: 'text',
        },
        {
          name: 'foregroundImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
