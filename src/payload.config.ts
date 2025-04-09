// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { FlatMedia } from './collections/FlatMedia'
import { MockPage } from './collections/MockPage'
import { MockPageUser } from './collections/MockPageUser'
import { Request } from './collections/Request'
import { QuestImpactMap } from './collections/QuestImpactMap'
import { QuestProduct } from './collections/QuestProduct'
import { Quest } from './collections/Quest'
import { QuestStateLog } from './collections/QuestStateLog'
import { QuestUsers } from './collections/QuestUsers'
import { QuestMedia } from './collections/QuestMedia'

console.log('process.env.PAYLOAD_SECRET: ', process.env.PAYLOAD_SECRET)
console.log('process.env.MONGODB_URI: ', process.env.MONGODB_URI)

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    FlatMedia,
    MockPage,
    MockPageUser,
    Request,
    QuestImpactMap,
    QuestProduct,
    Quest,
    QuestStateLog,
    QuestUsers,
    QuestMedia,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '123',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || process.env.EXTERNAL_SRV || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
