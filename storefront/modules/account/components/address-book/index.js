import React from "react"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"

const AddressBook = ({ user, region }) => {

  const addresses = user.addresses;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
        <AddAddress region={region} />
        {addresses.map((address) => {
          return <EditAddress region={region} address={address} key={address.id} />;
        })}
      </div>
    </div>
  );
}
export default AddressBook

