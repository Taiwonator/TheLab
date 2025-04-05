import type { CollectionConfig } from 'payload'

export const MockPage: CollectionConfig = {
  slug: 'mock-pages',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'blocks',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'userTypes',
          type: 'relationship',
          relationTo: 'mock-page-users',
          hasMany: true,
        },
      ],
    },
  ],
}
