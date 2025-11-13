import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { file } from 'zod/v4'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        consumes: ['multipart/form-data'],
        // body: z.object({
        //   file: z.instanceof(File).describe('Image file to upload'),
        // }),
        response: {
          201: z.object({ uploadId: z.string() }),
          400: z
            .object({ message: z.string() })
            .describe('Validation error or file is missing.'),
          409: z
            .object({ message: z.string() })
            .describe('Upload already exists.'),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: { fileSize: 1024 * 1024 * 2 }, // 2MB
      })

      if (!uploadedFile) {
        return reply.status(400).send({ message: 'File is required' })
      }

      const result = await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentSteam: uploadedFile.file,
      })

      if (isRight(result)) {
        console.log(unwrapEither(result))
        return reply.status(201).send({ uploadId: result.right.url })
      }

      const error = unwrapEither(result)
      switch (error.constructor.name) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}
