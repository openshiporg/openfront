"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CirclePlus, FileText, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface CreateRegionDropdownProps {
  onCreateClick: (mode: 'scratch' | 'popular') => void;
}

export function CreateRegionDropdown({ onCreateClick }: CreateRegionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            buttonVariants({ size: "icon" }),
            "lg:px-4 lg:py-2 lg:w-auto rounded-lg gap-2"
          )}
        >
          <CirclePlus className="h-4 w-4" />
          <span className="hidden lg:inline">Add Region</span>
          <ChevronDown className="h-3 w-3 hidden lg:inline" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onCreateClick('scratch')}>
          <FileText className="w-4 h-4 mr-3" />
          <div className="flex flex-col">
            <span className="font-medium">Create from Scratch</span>
            <span className="text-xs text-muted-foreground">
              Configure everything manually
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onCreateClick('popular')}>
          <Sparkles className="w-4 h-4 mr-3" />
          <div className="flex flex-col">
            <span className="font-medium">Add Popular Regions</span>
            <span className="text-xs text-muted-foreground">
              Quick setup with templates
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}