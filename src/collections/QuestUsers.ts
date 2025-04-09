import type { CollectionConfig } from 'payload'

export const QuestUsers: CollectionConfig = {
  slug: 'quest-users',
  admin: {
    useAsTitle: 'name',
    description: 'Users who can create and manage quests',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
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
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const now = new Date();
        
        return {
          ...data,
          dateCreated: data.dateCreated || now,
          dateModified: now,
        };
      },
    ],
  },
}
