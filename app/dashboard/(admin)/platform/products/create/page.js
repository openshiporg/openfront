"use client";

import { useKeystone, useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { Button } from "@ui/button";
import { Save } from "lucide-react";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { MediaTab } from "./components/MediaTab";
import { VariantsTab } from "./components/VariantsTab";

export function getFilteredProps(props, modifications, defaultCollapse) {
  const fieldKeysToShow = modifications.map((mod) => mod.key);
  const breakGroups = modifications.reduce((acc, mod) => {
    if (mod.breakGroup) {
      acc.push(mod.breakGroup);
    }
    return acc;
  }, []);

  const newFieldModes = { ...props.fieldModes };

  Object.keys(props.fields).forEach((key) => {
    if (!fieldKeysToShow.includes(key)) {
      newFieldModes[key] = "hidden";
    } else {
      newFieldModes[key] = props.fieldModes[key] || "edit";
    }
  });

  const updatedFields = Object.keys(props.fields).reduce((obj, key) => {
    const modification = modifications.find((mod) => mod.key === key);
    if (modification) {
      obj[key] = {
        ...props.fields[key],
        fieldMeta: {
          ...props.fields[key].fieldMeta,
          ...modification.fieldMeta,
        },
      };
    } else {
      obj[key] = props.fields[key];
    }
    return obj;
  }, {});

  const reorderedFields = modifications.reduce((obj, mod) => {
    obj[mod.key] = updatedFields[mod.key];
    return obj;
  }, {});

  const updatedGroups = props.groups.map((group) => {
    if (breakGroups.includes(group.label)) {
      return {
        ...group,
        fields: group.fields.filter(
          (field) => !fieldKeysToShow.includes(field.path)
        ),
      };
    }
    return {
      ...group,
      collapsed: defaultCollapse,
    };
  });

  return {
    ...props,
    fields: reorderedFields,
    fieldModes: newFieldModes,
    groups: updatedGroups,
  };
}

const GENERAL_FIELDS = [
  { key: "title" },
  { key: "handle" },
  { key: "description" },
  { key: "subtitle" },
  { key: "status" },
  { key: "isGiftcard" },
];

const ORGANIZATION_FIELDS = [
  { 
    key: "productCollections", 
    fieldMeta: { hideButtons: true } 
  },
  { 
    key: "productCategories", 
    fieldMeta: { hideButtons: true } 
  },
  { 
    key: "productTags", 
    fieldMeta: { hideButtons: true } 
  },
];

const tabs = ["General", "Media", "Variants", "Pricing", "Inventory"];

export default function CreateProductPage() {
  const list = useList("Product");
  const { createViewFieldModes } = useKeystone();
  const { create, props, state, error } = useCreateItem(list);
  const router = useRouter();

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef([]);

  const generalProps = getFilteredProps(props, GENERAL_FIELDS, false);
  const organizationProps = getFilteredProps(props, ORGANIZATION_FIELDS, false);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const firstElement = tabRefs.current[0];
      if (firstElement) {
        const { offsetLeft, offsetWidth } = firstElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, []);

  const handleSave = async () => {
    const item = await create();
    if (item) {
      router.push(`/dashboard/platform/products/${item.id}/variants`);
    }
  };

  const renderTabContent = () => {
    switch (activeIndex) {
      case 0:
        return <Fields {...generalProps} />;
      case 1:
        return <MediaTab {...props} />;
      case 2:
        return <VariantsTab {...props} />;
      case 3:
        return (
          <Fields
            {...props}
            fields={{
              discountable: list.fields.discountable,
              discountConditions: list.fields.discountConditions,
              discountRules: list.fields.discountRules,
              taxRates: list.fields.taxRates,
            }}
          />
        );
      case 4:
        return (
          <Fields
            {...props}
            fields={{
              weight: list.fields.weight,
              length: list.fields.length,
              height: list.fields.height,
              width: list.fields.width,
              hsCode: list.fields.hsCode,
              originCountry: list.fields.originCountry,
              midCode: list.fields.midCode,
              material: list.fields.material,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      <PageBreadcrumbs
        items={[
          {
            type: "link",
            label: "Dashboard",
            href: "/",
          },
          {
            type: "model",
            label: list.label,
            href: `/dashboard/platform/products`,
            showModelSwitcher: true,
          },
          {
            type: "page",
            label: "Create",
          },
        ]}
      />

      <main className="w-full max-w-[90rem] mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex-col items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              Create {list.singular}
            </h1>
            <p className="text-muted-foreground text-sm">
              Create a new product with variants, images, and more
            </p>
          </div>
          <Button
            isLoading={state === "loading"}
            onClick={handleSave}
            size="default"
            className="h-9"
          >
            <Save className="mr-2 h-4 w-4" />
            Save and continue
          </Button>
        </div>

        {error && (
          <GraphQLErrorNotice
            networkError={error?.networkError}
            errors={error?.graphQLErrors}
          />
        )}
        {createViewFieldModes.state === "error" && (
          <GraphQLErrorNotice
            networkError={
              createViewFieldModes.error instanceof Error
                ? createViewFieldModes.error
                : undefined
            }
            errors={
              createViewFieldModes.error instanceof Error
                ? undefined
                : createViewFieldModes.error
            }
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="border rounded-lg shadow-sm bg-background">
              <div className="border-b px-1">
                <div className="relative">
                  {/* Hover Highlight */}
                  <div
                    className="absolute h-[28px] mt-1 transition-all duration-300 ease-out bg-muted/60 rounded-[6px] flex items-center"
                    style={{
                      ...hoverStyle,
                      opacity: hoveredIndex !== null ? 1 : 0,
                    }}
                  />

                  {/* Active Indicator */}
                  <div
                    className="absolute bottom-[-1px] h-[2px] bg-foreground transition-all duration-300 ease-out"
                    style={activeStyle}
                  />

                  {/* Tabs */}
                  <div className="relative flex space-x-[6px] items-center">
                    {tabs.map((tab, index) => (
                      <div
                        key={index}
                        ref={(el) => (tabRefs.current[index] = el)}
                        className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
                          index === activeIndex
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setActiveIndex(index)}
                      >
                        <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                          {tab}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4">{renderTabContent()}</div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border bg-background shadow-sm">
              <div className="flex items-center justify-between border-b p-4">
                <div className="space-y-0.5">
                  <h2 className="text-base font-medium">Organization</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage product organization and collections
                  </p>
                </div>
              </div>
              <div className="p-4">
                <Fields {...organizationProps} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
