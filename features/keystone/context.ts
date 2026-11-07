import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import { type Context } from '.keystone/types'
import * as PrismaModule from "@prisma/client";

// One Keystone context (one Prisma pool) per process, across hot reloads and Next's server layers.
export const keystoneContext: Context =
  (globalThis as any).keystoneContext ?? getContext(config, PrismaModule)

// Next evaluates this module in several server layers (RSC, route handlers, instrumentation). Keep one context
// per Node process in every environment so each layer does not open its own Prisma pool.
;(globalThis as any).keystoneContext = keystoneContext
