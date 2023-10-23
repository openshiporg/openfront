import clsx from "clsx"
import React from "react"
import { useHits } from "react-instantsearch-hooks-web";

const DesktopHits = ({
  hitComponent: Hit,
  className,
  ...props
}) => {
  const { hits } = useHits(props)

  return (
    <div
      className={clsx(
        "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
        className,
        {
          "max-h-[1000px] opacity-100": !!hits.length,
          "max-h-0 opacity-0": !hits.length,
        }
      )}>
      <div className="grid grid-cols-1">
        {hits.map((hit, index) => (
          <li key={index} className="list-none">
            <Hit hit={hit} />
          </li>
        ))}
      </div>
    </div>
  );
}

export default DesktopHits
