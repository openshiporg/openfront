import { useModal } from "@lib/context/modal-context"
import Hit from "@modules/search/components/hit";
import { useRouter } from "next/navigation"

const DesktopHit = ({
  hit
}) => {
  const { close } = useModal()
  const { push } = useRouter()

  const go = () => {
    push(`/products/${hit.handle}`)
    close()
  }

  return (
    <button className="w-full text-left" onClick={go}>
      <Hit hit={hit} />
    </button>
  );
}

export default DesktopHit
