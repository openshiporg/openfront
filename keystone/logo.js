import { cn } from "./utils/cn";
import { Triangle } from "lucide-react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const LogoIcon = ({ className }) => {
  return (
    <div className="basis-4 flex items-center justify-center">
      <Triangle
        className={cn(
          "fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950 w-full h-full",
          className
        )}
      />
    </div>
  );
};

export const Logo = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2 text-zinc-700 dark:text-white", outfit.className, className)}>
      <LogoIcon />
      <h1 className="tracking-[0.02em] mb-1 font-medium text-2xl text-center">
        open<span className="font-light">front</span>
      </h1>
    </div>
  );
};
