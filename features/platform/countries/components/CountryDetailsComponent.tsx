"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { EditItemDrawer } from "../../components/EditItemDrawer";

const statusColors = {
  "active": "emerald",
  "inactive": "zinc"
} as const;

interface Country {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  numCode: number;
  displayName: string;
  region?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface CountryDetailsComponentProps {
  country: Country;
  list: any;
}

export function CountryDetailsComponent({
  country,
  list,
}: CountryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={country.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Country Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/countries/${country.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {country.name || country.displayName}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(country.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Add more fields display here as needed */}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                {country.status && (
                  <Badge
                    color={
                      statusColors[country.status as keyof typeof statusColors] ||
                      "zinc"
                    }
                    className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                  >
                    {country.status.toUpperCase()}
                  </Badge>
                )}
                
                {/* Action buttons */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    onClick={() => setIsEditDrawerOpen(true)}
                  >
                    <MoreVertical className="stroke-muted-foreground" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    asChild
                  >
                    <AccordionTrigger className="py-0" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <AccordionContent className="pb-0">
            <div className="divide-y">
              {/* Expanded content - customize based on your entity fields */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Display Name:</span>
                    <span className="ml-2 font-medium">{country.displayName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ISO2:</span>
                    <span className="ml-2 font-medium">{country.iso2}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ISO3:</span>
                    <span className="ml-2 font-medium">{country.iso3}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Region:</span>
                    <span className="ml-2 font-medium">{country.region?.name || 'N/A'}</span>
                  </div>
                  {country.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(country.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawer
        list={list}
        item={country}
        itemId={country.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
