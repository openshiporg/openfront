"use client"

import { useState } from "react"
import Back from "../../../common/icons/back"
import FastDelivery from "../../../common/icons/fast-delivery"
import Refresh from "../../../common/icons/refresh"

import Accordion from "./accordion"

// Define inline types based on schema assumptions
type Measurement = {
  type: string;
  value: string | number; // Assuming value can be string or number
  unit: string;
};

type ProductVariantForTabs = {
  id: string;
  measurements?: Measurement[] | null;
};

type ProductTypeInfo = {
  value: string;
  // Add other fields if needed
};

type ProductTagInfo = {
  id: string;
  value: string;
  // Add other fields if needed
};

type ProductForTabs = {
  id: string;
  material?: string | null;
  originCountry?: string | null; // Corrected name
  productType?: ProductTypeInfo | null; // Corrected name and assumed structure
  productVariants?: ProductVariantForTabs[] | null; // Corrected name
  tags?: ProductTagInfo[] | null; // Assumed structure
};

type ProductTabsProps = {
  product: ProductForTabs; // Use defined type
};

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState(0)

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
      {/* Accordion for large screens */}
      <div className="hidden lg:block">
        <Accordion type="multiple">
          {tabs.map((tab, i) => (
            <Accordion.Item
              key={i}
              title={tab.label}
              headingSize="medium"
              value={tab.label}
            >
              {tab.component}
            </Accordion.Item>
          ))}
        </Accordion>
      </div>

      {/* Regular tabs for medium and small screens */}
      <div className="lg:hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === i
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="pt-4">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  // Helper function to find measurement by type
  const getMeasurement = (type: string) => {
    const variant = product.productVariants?.[0]; // Using first variant for now
    if (!variant?.measurements?.length) return null;

    return variant.measurements.find((m: Measurement) => m.type === type); // Use Measurement type
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
    <div className="text-xs leading-5 font-normal py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.originCountry ? product.originCountry : "-"}</p> {/* Corrected prop name */}
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.productType ? product.productType.value : "-"}</p> {/* Corrected prop name */}
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
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-xs leading-5 font-normal py-8">
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
  )
}

export default ProductTabs
