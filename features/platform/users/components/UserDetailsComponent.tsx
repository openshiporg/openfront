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
  "has_account": "emerald",
  "no_account": "zinc"
} as const;

interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  hasAccount: boolean;
  role?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface UserDetailsComponentProps {
  user: User;
  list: any;
}

export function UserDetailsComponent({
  user,
  list,
}: UserDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={user.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* User Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/users/${user.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {user.name || `${user.firstName} ${user.lastName}`.trim() || user.email}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
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
                <Badge
                  color={
                    user.hasAccount ? "emerald" : "zinc"
                  }
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {user.hasAccount ? "HAS ACCOUNT" : "NO ACCOUNT"}
                </Badge>
                
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
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{user.email}</span>
                  </div>
                  {user.role && (
                    <div>
                      <span className="text-muted-foreground">Role:</span>
                      <span className="ml-2 font-medium">{user.role.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <span className="ml-2 font-medium">{user.id}</span>
                  </div>
                  {user.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(user.updatedAt).toLocaleDateString()}
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
        item={user}
        itemId={user.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
