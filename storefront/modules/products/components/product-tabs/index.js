"use client";
import Back from "@storefront/modules/common/icons/back"
import FastDelivery from "@storefront/modules/common/icons/fast-delivery"
import Refresh from "@storefront/modules/common/icons/refresh"

import Accordion from "./accordion"

const ProductTabs = ({
  product
}) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item key={i} title={tab.label} headingSize="medium" value={tab.label}>
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

const ProductInfoTab = ({
  product
}) => {
  // Helper function to find measurement by type
  const getMeasurement = (type) => {
    const variant = product.productVariants?.[0]; // Using first variant for now
    if (!variant?.measurements?.length) return null;
    
    return variant.measurements.find(m => m.type === type);
  };

  // Get weight and dimensions measurements
  const weightMeasurement = getMeasurement('weight');
  const lengthMeasurement = getMeasurement('length');
  const widthMeasurement = getMeasurement('width');
  const heightMeasurement = getMeasurement('height');

  // Format dimensions string if all dimensions exist
  const dimensionsString = lengthMeasurement && widthMeasurement && heightMeasurement
    ? `${lengthMeasurement.value}${lengthMeasurement.unit} x ${widthMeasurement.value}${widthMeasurement.unit} x ${heightMeasurement.value}${heightMeasurement.unit}`
    : "-";

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{weightMeasurement ? `${weightMeasurement.value} ${weightMeasurement.unit}` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>{dimensionsString}</p>
          </div>
        </div>
      </div>
      {product.tags?.length ? (
        <div>
          <span className="font-semibold">Tags</span>
        </div>
      ) : null}
    </div>
  );
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductTabs
