import { Text } from "@medusajs/ui"

import Openfront from "../../../common/icons/openfront"
import NextJs from "../../../common/icons/nextjs"

const OpenfrontCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center">
      Powered by
      <a href="https://www.openship.org" target="_blank" rel="noreferrer">
        <Openfront fill="#9ca3af" className="fill-[#9ca3af]" />
      </a>
      &
      <a href="https://nextjs.org" target="_blank" rel="noreferrer">
        <NextJs fill="#9ca3af" />
      </a>
    </Text>
  );
}

export default OpenfrontCTA
