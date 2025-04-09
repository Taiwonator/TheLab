import type { CollectionConfig } from 'payload'

export const QuestStateLog: CollectionConfig = {
  slug: 'quest-state-logs',
  admin: {
    useAsTitle: 'state',
    description: 'Logs of state changes for quests',
  },
  fields: [
    {
      name: 'questId',
      type: 'relationship',
      relationTo: 'quests',
      required: true,
      admin: {
        description: 'The quest this state log is associated with',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      admin: {
        description: 'Timestamp of when the state change occurred',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'state',
      type: 'select',
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Proposing', value: 'proposing' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Approved', value: 'approved' },
        { label: 'Denied', value: 'denied' },
      ],
      required: true,
      admin: {
        description: 'The state of the quest',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Notes about this state change',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Set timestamp if not already set
        if (!data.timestamp) {
          return {
            ...data,
            timestamp: new Date(),
          }
        }
        return data
      },
    ],
  },
}
