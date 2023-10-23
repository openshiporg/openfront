"use server"

import { revalidateTag } from "next/cache"

/**
 * Revalidates each cache tag in the passed array
 * @param {string[]} tags - array of tags to revalidate
 */
export async function revalidateTags(tags) {
  tags.forEach((tag) => {
    revalidateTag(tag)
  })
}
