import { cn } from "@/lib/utils";
import { Syne } from "next/font/google";
import { LogoIcon } from "./LogoIcon";

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const LOGO_COLOR = "#6366f1";

interface LogoProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  variant?: "default" | "sidebar";
}

export const Logo = ({
  className,
  textClassName,
  iconClassName,
  variant = "default",
}: LogoProps) => {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        className,
        "flex items-center text-left",
        isSidebar ? "gap-1.5" : "gap-3",
      )}
    >
      <LogoIcon
        className={cn("shrink-0", isSidebar ? "size-5" : "size-8", iconClassName)}
        color={LOGO_COLOR}
        suffix="-full"
      />
      <div className={cn("flex flex-col justify-center", isSidebar ? "-mt-0.5" : "-mt-1")}>
        <span
          className={cn(
            syne.className,
            textClassName,
            "font-semibold tracking-tight text-foreground",
            isSidebar ? "text-[15px] leading-none" : "text-xl",
          )}
        >
          open<span className="font-normal">front</span>
        </span>
        <span
          className={cn(
            syne.className,
            "font-bold uppercase text-muted-foreground",
            isSidebar
              ? "mt-0.5 text-[8px] leading-none tracking-[0.14em]"
              : "text-[10px] tracking-wider",
          )}
        >
          E-commerce
        </span>
      </div>
    </div>
  );
};

export { LogoIcon };
