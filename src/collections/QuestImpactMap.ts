import type { CollectionConfig } from 'payload'

export const QuestImpactMap: CollectionConfig = {
  slug: 'quest-impact-maps',
  admin: {
    useAsTitle: 'title',
    description: 'Impact maps for quest products',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'Nodes',
      type: 'json',
      admin: {
        description: 'JSON object containing columns with nodes. Format: { column_key: { index: number, description: string, items: node[] } }',
      },
    },
  ],
  timestamps: true,
}
