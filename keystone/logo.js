import Link from "next/link";
import { LogoIconSVG } from "@svg";
import { cn } from "./utils/cn";
import { Circle, CircleDot, Square, Triangle } from "lucide-react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const Logo = ({ size = "md", className }) => {
  const textClasses = {
    sm: "text-xs md:text-md",
    md: "text-2xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
  };

  const iconClasses = {
    sm: "mr-2 w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-[1.25rem] md:h-[1.25rem]",
    md: "mt-[3.5px] mr-2 w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-[1.15rem] md:h-[1.15rem]",
    lg: "mr-2 w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-[1.25rem] md:h-[1.25rem]",
  };

  return (
    <h3 className={cn(`${outfit.className} ${className}`)}>
      <div className={cn("flex items-center text-zinc-700 dark:text-white")}>
        <Triangle
          className={cn(
            "mt-[2px] w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[1.3rem] md:h-[1.3rem] fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950",
            iconClasses[size]
          )}
        />
        <h1
          className={cn(
            "tracking-[0.02em] mb-0.5 font-medium text-center",
            textClasses[size]
          )}
        >
          open<span className="font-light">front</span>
        </h1>
      </div>
    </h3>
  );
};
