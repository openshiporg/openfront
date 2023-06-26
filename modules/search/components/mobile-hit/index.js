import { useMobileMenu } from "@storefront/context/mobile-menu-context";
import Hit from "@modules/search/components/hit";
import { useRouter } from "next/router";

const MobileHit = ({ hit }) => {
  const { close } = useMobileMenu();
  const { push } = useRouter();

  const go = () => {
    push(`/products/${hit.handle}`);
    close();
  };

  return (
    <button className="w-full text-left" onClick={go}>
      <Hit hit={hit} />
    </button>
  );
};

export default MobileHit;
