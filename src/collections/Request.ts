import type { CollectionConfig } from 'payload'

export const Request: CollectionConfig = {
  slug: 'request',
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

/* 

Create me collections in PayloadCMS to fit fir this schema. Where there is a _id on a collection level
you don't need to define an id and payloadcms will do it for you. For the id within within the node.

Data Models

- QuestImpactMap: collection
- QuestImpactMap._id: generated ID
- QuestImpactMap.Nodes: object { 'column_key': { index: number, description: string, items: node[] } }
- QuestImpactMap.Nodes.node: string
- QuestImpactMap.Nodes.node.id: string (random id string)
- QuestImpactMap.Nodes.node.text: string
- QuestImpactMap.Nodes.node.: string

- QuestProduct: collection
- QuestProduct._id: generated ID
- QuestProduct.ImpactMap: node[]
- QuestProduct.Agent: object
- QuestProduct.Agent.memory: string

- Quest: collection
- Quest._id: string
- Quest.productId: string (generated ID of QuestProduct)
- Quest.userId: string (generated ID of QuestUser)
- Quest.overview: string 
- Quest.dateCreated: date
- Quest.dateModified: date
- Quest.AILabels: object
- Quest.AILabels.source (what entity is making request)
- Quest.AILabels.type (what is it)
- Quest.AILabels.system (what system does it affect)
- Quest.AILabels.outcome (what is the outcome)

- QuestStateLog: collection
- QuestStateLog._id: string
- QuestStateLog.questId: string (ID of Quest)
- QuestStateLog.timestamp: date
- QuestStateLog.state: string<created | proposing | approved | rejected>

- QuestUsers: collection
- QuestUsers._id: string
- QuestUsers.name: string
- QuestUsers.email: string
- QuestUsers.dateCreated: date
- QuestUsers.dateModified: date

*/
