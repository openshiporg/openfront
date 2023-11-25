"use client";
import { cn } from "@keystone/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@keystone/primitives/default/ui/separator";
import { ScrollArea } from "@keystone/primitives/default/ui/scroll-area";

export function DashboardNav({ items }) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/dashboard";

  return (
    <nav className="flex pb-10 h-full">
      <Separator
        orientation="vertical"
        className="w-[2px] ml-[1.75rem] bg-gradient-to-b dark:from-[#13255a] dark:to-blue-900"
        // style={{ height: `calc(100% + 60px)` }}
      />
      <ScrollArea>
        <div className="pl-3">
          {items.map((item, index) => {
            if (item.href) {
              const href = `${adminPath}${item.href}`;

              return (
                <Link
                  key={index}
                  href={item.disabled ? "/" : `${href}`}
                  className={cn(
                    "group flex items-center rounded-md mr-4 mt-[.35rem] px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    path.startsWith(href) ? "bg-accent" : "transparent",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              );
            }
          })}
        </div>
      </ScrollArea>
    </nav>
  );
}
