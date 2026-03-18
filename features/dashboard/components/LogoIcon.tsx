import { SYSmoAILogo } from "@/components/ui/sysmoai-logo";

interface LogoIconProps {
  className?: string;
  suffix?: string;
  size?: number;
  variant?: "mono-black" | "mono-white" | "brand-dark" | "brand-light";
}

export const LogoIcon = ({
  size = 20,
  variant = "brand-dark",
}: LogoIconProps) => {
  return <SYSmoAILogo size={size} variant={variant} />;
};
