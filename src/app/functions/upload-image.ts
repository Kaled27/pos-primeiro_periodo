import { Readable } from 'node:stream'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import z from 'zod'
import { InvalidFileFormat } from './errors/invalide-file-format'

const uploadImageInput = z.object({
  fileName: z.string(),
  contentType: z.string(),
  contentSteam: z.instanceof(Readable),
})

type uploadImageInput = z.input<typeof uploadImageInput>

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

export async function uploadImage(
  input: uploadImageInput
): Promise<Either<InvalidFileFormat, { url: string }>> {
  const { contentType, contentSteam, fileName } = uploadImageInput.parse(input)

  if (!allowedMimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormat())
  }

  await db
    .insert(schema.uploads)
    .values({ name: fileName, remoteKey: fileName, remoteUrl: fileName })
  return makeRight({ url: '' })
}
