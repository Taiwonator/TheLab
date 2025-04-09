import type { CollectionConfig } from 'payload'

export const QuestMedia: CollectionConfig = {
  slug: 'quest-media',
  admin: {
    useAsTitle: 'title',
    description: 'Media files attached to quests',
  },
  upload: {
    staticURL: '/quest-media',
    staticDir: 'quest-media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    filesRequireAuth: false,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description of the media file',
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alternative text for images (for accessibility)',
      },
    },
  ],
  timestamps: true,
}
