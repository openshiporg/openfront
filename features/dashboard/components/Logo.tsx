import { cn } from "@/lib/utils";
import { SYSmoAILogo, SYSmoAIWordmark } from "@/components/ui/sysmoai-logo";

interface LogoProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  variant?: "mono-black" | "mono-white" | "brand-dark" | "brand-light";
  size?: number;
}

export const Logo = ({
  className,
  variant = "brand-dark",
  size = 28,
}: LogoProps) => {
  const wordColor = variant === "mono-black" || variant === "brand-light"
    ? "#000000"
    : "#FFFFFF";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <SYSmoAILogo size={size} variant={variant} />
      <SYSmoAIWordmark size={Math.round(size * 0.57)} color={wordColor} />
    </div>
  );
};

export { SYSmoAILogo as LogoIcon };
