import type { CollectionConfig } from 'payload'

export const MockPageUser: CollectionConfig = {
  slug: 'mock-page-users',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
