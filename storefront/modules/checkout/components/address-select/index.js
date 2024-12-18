import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDown } from "@medusajs/icons";
import { clx } from "@medusajs/ui";
import { Fragment, useMemo, useState } from "react";

import Radio from "@storefront/modules/common/components/radio";
import compareAddresses from "@storefront/lib/util/compare-addresses";

const AddressSelect = ({ addresses, cart, onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    const savedAddress = addresses.find((a) => a.id === id);
    if (savedAddress) {
      setSelected(savedAddress);
      onSelect(savedAddress);
    }
  };

  const selectedAddress = useMemo(() => {
    return addresses.find((a) => compareAddresses(a, cart?.shippingAddress)) || selected;
  }, [addresses, cart?.shippingAddress, selected]);

  return (
    <Listbox onChange={handleSelect} value={selectedAddress?.id}>
      <div className="relative">
        <Listbox.Button className="relative w-full flex justify-between items-center px-4 py-[10px] text-left bg-white cursor-default focus:outline-none border rounded-rounded focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-gray-300 focus-visible:ring-offset-2 focus-visible:border-gray-300 text-base-regular">
          {({ open }) => (
            <>
              <span className="block truncate">
                {selectedAddress
                  ? `${selectedAddress.firstName} ${selectedAddress.lastName}, ${selectedAddress.address1}`
                  : "Choose an address"}
              </span>
              <ChevronUpDown
                className={clx("transition-rotate duration-200", {
                  "transform rotate-180": open,
                })}
              />
            </>
          )}
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-20 w-full overflow-auto text-small-regular bg-white border border-top-0 max-h-60 focus:outline-none sm:text-sm rounded-lg mt-1">
            {addresses.map((address) => {
              return (
                <Listbox.Option
                  key={address.id}
                  value={address.id}
                  className="cursor-default select-none relative pl-6 pr-10 hover:bg-gray-50 py-4"
                >
                  <div className="flex gap-x-4 items-start">
                    <Radio checked={selectedAddress?.id === address.id} />
                    <div className="flex flex-col">
                      <span className="text-left text-base-semi">
                        {address.firstName} {address.lastName}
                      </span>
                      {address.company && (
                        <span className="text-small-regular text-ui-fg-base">
                          {address.company}
                        </span>
                      )}
                      <div className="flex flex-col text-left text-base-regular mt-2">
                        <span>
                          {address.address1}
                          {address.address2 && (
                            <span>, {address.address2}</span>
                          )}
                        </span>
                        <span>
                          {address.postalCode}, {address.city}
                        </span>
                        <span>
                          {address.province && `${address.province}, `}
                          {address.countryCode?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default AddressSelect;
