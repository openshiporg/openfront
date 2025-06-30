// Removed Text import

import Openfront from "../../../common/icons/openfront" // Uses Openfront icon
import NextJs from "../../../common/icons/nextjs"

// Renamed from MedusaCTA to OpenfrontCTA
const OpenfrontCTA = () => {
  return (
    <span className="flex gap-x-2 text-[0.8125rem] leading-5 font-medium items-center">
      {/* Replace Text with span */}
      Powered by
      <a href="https://www.openship.org" target="_blank" rel="noreferrer"> {/* <-- Link to openship.org */}
        <Openfront fill="#9ca3af" className="fill-[#9ca3af]" />
      </a>
      &amp;
      <a href="https://nextjs.org" target="_blank" rel="noreferrer">
        <NextJs fill="#9ca3af" />
      </a>
    </span>
  );
}

export default OpenfrontCTA // Export the renamed component
