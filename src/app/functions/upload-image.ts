import { Readable } from 'node:stream'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import z from 'zod'
import { fi } from 'zod/v4/locales'

const uploadImageInput = z.object({
  fileName: z.string(),
  contentType: z.string(),
  contentSteam: z.instanceof(Readable),
})

type uploadImageInput = z.input<typeof uploadImageInput>

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

export async function uploadImage(input: uploadImageInput) {
  const { contentType, contentSteam, fileName } = uploadImageInput.parse(input)

  if (!allowedMimeTypes.includes(contentType)) {
    throw new Error('Invalid file type.')
  }

  await db
    .insert(schema.uploads)
    .values({ name: fileName, remoteKey: fileName, remoteUrl: fileName })
}
