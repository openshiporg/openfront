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
      <Triangle
        className={cn(
          "fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950",
          className
        )}
      />
  );
};

export const Logo = ({ className }) => {
  return (
    <div className={cn(outfit.className, className)}>
      <LogoIcon />
      <h1 className="tracking-[0.02em] mb-1 font-medium text-xl text-zinc-700 dark:text-white">
        open<span className="font-light">front</span>
      </h1>
    </div>
  );
};
