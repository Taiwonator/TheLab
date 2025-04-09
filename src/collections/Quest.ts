import type { CollectionConfig } from 'payload'

export const Quest: CollectionConfig = {
  slug: 'quests',
  admin: {
    useAsTitle: 'overview',
    description: 'Quests created by users for specific products',
  },
  fields: [
    {
      name: 'productId',
      type: 'relationship',
      relationTo: 'quest-products',
      required: true,
      admin: {
        description: 'The product this quest is associated with',
      },
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'quest-users',
      required: true,
      admin: {
        description: 'The user who created this quest',
      },
    },
    {
      name: 'overview',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Overview of the quest',
      },
    },
    {
      name: 'AILabels',
      type: 'group',
      admin: {
        description: 'AI-generated labels for this quest',
      },
      fields: [
        {
          name: 'source',
          type: 'text',
          admin: {
            description: 'What entity is making the request',
          },
        },
        {
          name: 'type',
          type: 'text',
          admin: {
            description: 'What is it',
          },
        },
        {
          name: 'system',
          type: 'text',
          admin: {
            description: 'What system does it affect',
          },
        },
        {
          name: 'outcome',
          type: 'text',
          admin: {
            description: 'What is the outcome',
          },
        },
      ],
    },
    {
      name: 'dateCreated',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'dateModified',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'quest-media',
      hasMany: true,
      admin: {
        description: 'Media files attached to this quest',
      },
    },
    {
      name: 'proposal',
      type: 'textarea',
      admin: {
        description: 'Proposal for this quest',
        condition: (data) => {
          // Only show this field in the admin panel if the quest has a state log with 'proposing' state
          return true // We'll always show it in admin, but control visibility on frontend
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const now = new Date()

        return {
          ...data,
          dateCreated: data.dateCreated || now,
          dateModified: now,
        }
      },
    ],
  },
}
