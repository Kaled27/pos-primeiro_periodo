import { Readable } from 'stream'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { uploadImage } from './upload-image'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { randomUUID } from 'crypto'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { eq } from 'drizzle-orm'
import { InvalidFileFormat } from './errors/invalide-file-format'
import { makeUpload } from '@/test/factories/make-upload'
import { getUploads } from './get-uploads'
import dayjs from 'dayjs'

describe('get uploads', () => {
    it('should be able to get uploads', async () => {
        const namePattern = randomUUID();

        const upload1 = await makeUpload({ name: `${namePattern}.webp` });
        const upload2 = await makeUpload({ name: `${namePattern}.webp` })
        const upload3 = await makeUpload({ name: `${namePattern}.webp` })
        const upload4 = await makeUpload({ name: `${namePattern}.webp` })
        const upload5 = await makeUpload({ name: `${namePattern}.webp` })

        const sut = await getUploads({
            searchQuery: namePattern,
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toEqual(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload5.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload3.id }),
            expect.objectContaining({ id: upload2.id }),
            expect.objectContaining({ id: upload1.id }),
        ])
    })

    it('should be able to get paginated uploads', async () => {
        const namePattern = randomUUID();

        const upload1 = await makeUpload({ name: `${namePattern}.webp` });
        const upload2 = await makeUpload({ name: `${namePattern}.webp` })
        const upload3 = await makeUpload({ name: `${namePattern}.webp` })
        const upload4 = await makeUpload({ name: `${namePattern}.webp` })
        const upload5 = await makeUpload({ name: `${namePattern}.webp` })

        let sut = await getUploads({
            searchQuery: namePattern,
            page: 1,
            pageSize: 3,
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toEqual(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload5.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload3.id }),
        ])

        sut = await getUploads({
            searchQuery: namePattern,
            page: 2,
            pageSize: 3,
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toEqual(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload2.id }),
            expect.objectContaining({ id: upload1.id }),
        ])
    })


    it('should be able to get sorted uploads', async () => {
        const namePattern = randomUUID();

        const upload1 = await makeUpload({ 
            name: `${namePattern}.webp`,
            createdAt: new Date(),
        });
        const upload2 = await makeUpload({ 
            name: `${namePattern}.webp`,
            createdAt: dayjs().subtract(1, 'day').toDate(),
        })
        const upload3 = await makeUpload({ 
            name: `${namePattern}.webp`,
            createdAt: dayjs().subtract(2, 'day').toDate(),
        })
        const upload4 = await makeUpload({ 
            name: `${namePattern}.webp`,
            createdAt: dayjs().subtract(3, 'day').toDate(),
        })
        const upload5 = await makeUpload({ 
            name: `${namePattern}.webp`,
            createdAt: dayjs().subtract(4, 'day').toDate(),
        })

        let sut = await getUploads({
            searchQuery: namePattern,
            sortBy: 'createdAt',
            sortDirection: 'desc',
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toEqual(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload1.id }),
            expect.objectContaining({ id: upload2.id }),
            expect.objectContaining({ id: upload3.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload5.id }),
        ])

        sut = await getUploads({
            searchQuery: namePattern,
            sortBy: 'createdAt',
            sortDirection: 'asc',
        })

        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut).total).toEqual(5)
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({ id: upload5.id }),
            expect.objectContaining({ id: upload4.id }),
            expect.objectContaining({ id: upload3.id }),
            expect.objectContaining({ id: upload2.id }),
            expect.objectContaining({ id: upload1.id }),
        ])
    })
})