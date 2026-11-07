import assert from 'node:assert/strict'
import test from 'node:test'
import { GraphQLError } from 'graphql'
import { throwKeystonePrismaErrors, rethrowKeystonePrismaError } from './keystonePrismaErrors'

// Keystone 6.5 returns (does not throw) this value from every failed Prisma query.
const returned = (code: string, message: string) => new GraphQLError(`Prisma error: ${message}`, { extensions: { code: 'KS_PRISMA_ERROR', prisma: { code, meta: { modelName: 'User' }, name: 'PrismaClientKnownRequestError' } } })

function keystoneLikeClient(log: string[]) {
  const delegate = {
    findFirst: async () => ({ id: 'u1' }),
    update: async ({ where }: any) => (where.id === 'missing' ? returned('P2025', 'No record was found for an update.') : { id: where.id }),
    create: async () => returned('P2002', 'Unique constraint failed on the fields: (`email`)'),
  }
  const client: any = {
    user: delegate,
    $executeRaw: async (sql: string) => { log.push(sql); return 1 },
    $transaction: async (work: any) => {
      if (Array.isArray(work)) return Promise.all(work)
      const pending: string[] = []
      const tx = { ...client, $executeRaw: async (sql: string) => { pending.push(sql); return 1 } }
      const result = await work(tx)
      log.push(...pending) // commit only when the callback resolves
      return result
    },
  }
  return client
}

test('a failed update inside a transaction throws, so the later write never commits', async () => {
  const log: string[] = []
  const prisma = throwKeystonePrismaErrors(keystoneLikeClient(log))
  await assert.rejects(prisma.$transaction(async (tx: any) => {
    await tx.$executeRaw('insert before')
    await tx.user.update({ where: { id: 'missing' }, data: {} })
    await tx.$executeRaw('insert after')
  }), (error: any) => error.code === 'P2025' && error.extensions?.code === 'KS_PRISMA_ERROR')
  assert.deepEqual(log, [])
})

test('without the wrapper the same transaction commits both writes (the bug)', async () => {
  const log: string[] = []
  const prisma = keystoneLikeClient(log)
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRaw('insert before')
    await tx.user.update({ where: { id: 'missing' }, data: {} })
    await tx.$executeRaw('insert after')
  })
  assert.deepEqual(log, ['insert before', 'insert after'])
})

test('a unique conflict outside a transaction throws with its Prisma code for constraint mappers', async () => {
  const prisma = throwKeystonePrismaErrors(keystoneLikeClient([]))
  await assert.rejects(prisma.user.create({ data: {} }), (error: any) => error.code === 'P2002' && error.meta?.modelName === 'User')
})

test('successful results, batch transactions and ordinary values pass through unchanged', async () => {
  const prisma = throwKeystonePrismaErrors(keystoneLikeClient([]))
  assert.deepEqual(await prisma.user.update({ where: { id: 'u1' }, data: {} }), { id: 'u1' })
  assert.deepEqual(await prisma.$transaction([prisma.user.findFirst({}), prisma.user.update({ where: { id: 'u2' }, data: {} })]), [{ id: 'u1' }, { id: 'u2' }])
  await assert.rejects(prisma.$transaction([prisma.user.update({ where: { id: 'missing' }, data: {} })]), (error: any) => error.code === 'P2025')
  const other = new GraphQLError('other')
  assert.equal(rethrowKeystonePrismaError(other), other)
  assert.equal(rethrowKeystonePrismaError(3), 3)
  assert.equal(throwKeystonePrismaErrors(keystoneLikeClient([])) === prisma, false)
})
