import type { CollectionConfig } from 'payload'

export const QuestProduct: CollectionConfig = {
  slug: 'quest-products',
  admin: {
    useAsTitle: 'name',
    description: 'Products that can be used to create quests',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'ImpactMap',
      type: 'relationship',
      relationTo: 'quest-impact-maps',
      admin: {
        description: 'The impact map associated with this product',
      },
    },
    {
      name: 'Agent',
      type: 'group',
      fields: [
        {
          name: 'memory',
          type: 'textarea',
          admin: {
            description: 'Memory for the agent associated with this product',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
