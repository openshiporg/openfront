"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, MapPin, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClient } from "../../components/EditItemDrawerClient";
import { Country } from "../actions/country-actions";

interface CountryDetailsComponentProps {
  country: Country;
  list: any;
}

export function CountryDetailsComponent({ country, list }: CountryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const statusColor = country.region ? "emerald" : "zinc";
  const statusText = country.region ? "ASSIGNED" : "UNASSIGNED";

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={country.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Country Flag/Icon */}
              <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <MapPin className="w-6 h-6 text-muted-foreground" />
              </div>

              {/* Country Info */}
              <div className="flex flex-col items-start text-left gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/regions?tab=countries&focus=${country.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {country.displayName}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {country.iso2}
                  </span>
                  <span>‧</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(country.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono">{country.iso3}</span>
                  <span>‧</span>
                  <span className="font-mono">#{country.numCode}</span>
                  {country.region && (
                    <>
                      <span>‧</span>
                      <Badge variant="secondary" className="text-xs">
                        {country.region.name}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={statusColor}
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {statusText}
                </Badge>

                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="border [&_svg]:size-3 h-6 w-6"
                      >
                        <MoreVertical className="stroke-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Country
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
            <div className="px-4 md:px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="ml-2 font-medium">{country.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ISO3 Code:</span>
                  <span className="ml-2 font-medium font-mono">{country.iso3}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Numeric Code:</span>
                  <span className="ml-2 font-medium">{country.numCode}</span>
                </div>
                {country.region && (
                  <div>
                    <span className="text-muted-foreground">Region:</span>
                    <Badge variant="secondary" className="ml-2">
                      {country.region.name} ({country.region.currency.code})
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {isEditDrawerOpen && (
        <EditItemDrawerClient
          list={list}
          item={country}
          itemId={country.id}
          onClose={() => setIsEditDrawerOpen(false)}
        />
      )}
    </>
  );
}