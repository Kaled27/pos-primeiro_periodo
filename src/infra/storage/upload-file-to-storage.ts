import { basename, extname } from "path";
import { Readable } from "stream";
import { uuidv7 } from "uuidv7";
import z from "zod";
import { r2 } from "./client";
import { env } from "@/env";
import { Upload } from "@aws-sdk/lib-storage";

const uploadFileToStorageSchema = z.object({
    folder: z.enum(['images', 'downloads']),
    fileName: z.string(),
    contentType: z.string(),
    contentSteam: z.instanceof(Readable),
})

type uploadFileToStorageInput = z.input<typeof uploadFileToStorageSchema>


export async function uploadFileToStorage(input: uploadFileToStorageInput) {
    const { fileName, contentType, contentSteam, folder } = uploadFileToStorageSchema.parse(input)

    const fileExtension = extname(fileName)
    const fileNameWithoutExtension = basename(fileName)

    const sanitizedFileName = fileNameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '')
    const sanitizedFileNameWithExtension = sanitizedFileName.concat(fileExtension)

    const uniqueFileName = `${folder}/${uuidv7()}-${sanitizedFileNameWithExtension}`

    const upload = new Upload({
        client: r2,
        params: {
            Key: uniqueFileName,
            Bucket: env.CLOUDFARE_BUCKET,
            Body: contentSteam,
            ContentType: contentType,
        },
    })

    await upload.done()

    return {
        key: uniqueFileName,
        url: new URL(uniqueFileName, env.CLOUDFARE_PUBLIC_URL).toString(),
    }
}   