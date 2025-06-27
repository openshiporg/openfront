"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/features/dashboard/components/Logo";
import { Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OnboardingStep {
  href: string;
  title: string;
  description: string;
}

// Base InfoCard components
interface CommonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InfoCardTitle = React.memo(
  ({ children, className, ...props }: CommonCardProps) => {
    return (
      <div className={cn("font-medium mb-1", className)} {...props}>
        {children}
      </div>
    );
  }
);
InfoCardTitle.displayName = "InfoCardTitle";

const InfoCardDescription = React.memo(
  ({ children, className, ...props }: CommonCardProps) => {
    return (
      <div
        className={cn("text-muted-foreground leading-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InfoCardDescription.displayName = "InfoCardDescription";

const InfoCardContent = React.memo(
  ({ children, className, ...props }: CommonCardProps) => {
    return (
      <div className={cn("flex flex-col gap-1 text-xs", className)} {...props}>
        {children}
      </div>
    );
  }
);
InfoCardContent.displayName = "InfoCardContent";

const InfoCardFooter = ({
  children,
  className,
  isHovered,
}: CommonCardProps & { isHovered: boolean }) => {
  return (
    <div
      className={cn(
        "flex justify-between text-xs text-muted-foreground mt-2 overflow-hidden transition-all duration-300 ease-spring",
        isHovered ? "max-h-[60px] opacity-100" : "max-h-0 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export function OnboardingCards({
  steps,
  onboardingStatus,
  onDismiss,
  onOpenDialog,
  userRole,
}: {
  steps: OnboardingStep[];
  onboardingStatus?: string;
  onDismiss: () => void;
  onOpenDialog: () => void;
  userRole?: any;
}) {
  const [dismissedSteps, setDismissedSteps] = React.useState<string[]>([]);
  const cards = steps.filter(({ href }) => !dismissedSteps.includes(href));
  const cardCount = cards.length;
  const [showCompleted, setShowCompleted] = React.useState(cardCount > 0);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (cardCount === 0)
      timeout = setTimeout(() => setShowCompleted(false), 2700);
    return () => clearTimeout(timeout);
  }, [cardCount]);

  // Don't show onboarding if user doesn't have permission
  if (!userRole?.canManageOnboarding) {
    return null;
  }

  if (onboardingStatus === "completed") {
    return null;
  }

  return cards.length || showCompleted ? (
    <div className="w-full">
      {cards.map(({ href, title, description }, idx) => (
        <OnboardingCard
          key={href}
          title={title}
          description={description}
          href={href}
          onDismiss={onDismiss}
          onOpenDialog={onOpenDialog}
        />
      ))}
    </div>
  ) : null;
}

function OnboardingCard({
  title,
  description,
  onDismiss,
  href,
  onOpenDialog,
}: {
  title: string;
  description: string;
  onDismiss?: () => void;
  href?: string;
  onOpenDialog: () => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* Full sidebar view */}
      <div
        className={cn(
          "group relative rounded-lg border bg-white dark:bg-black transition-all duration-300 ease-spring group-has-[[data-collapsible=icon]]/sidebar-wrapper:hidden",
          "opacity-100 translate-y-0",
          "hover:shadow-sm"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute -top-1 -right-1.5 z-10">
          <div className="h-3 w-3 rounded-full bg-blue-700 dark:bg-blue-400 border-blue-200 dark:border-blue-800/50 border-3 animate-pulse" />
        </div>
        <div className="flex items-start">
          <InfoCardContent className="pt-2 px-2">
            <InfoCardTitle>{title}</InfoCardTitle>
            <InfoCardDescription>{description}</InfoCardDescription>
          </InfoCardContent>
        </div>

        <InfoCardFooter isHovered={isHovered}>
          <div className="m-2 space-x-2">
            <Button size="sm" onClick={onOpenDialog} className="text-xs h-6">
              Get started
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-xs h-6"
            >
              Skip for now
            </Button>
          </div>
        </InfoCardFooter>
      </div>

      {/* Icon-only sidebar view */}
      <div
        className={cn(
          "hidden group-has-[[data-collapsible=icon]]/sidebar-wrapper:block",
          "relative"
        )}
      >
        <div className="absolute -top-1 -right-1.5 z-10">
          <div className="h-3 w-3 rounded-full bg-blue-700 dark:bg-blue-400 border-blue-200 dark:border-blue-800/50 border-3 animate-pulse" />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          // className="w-full h-9 hover:bg-accent hover:text-accent-foreground"
          onClick={onOpenDialog}
        >
          <Rocket className="size-3" />
        </Button>
      </div>
    </>
  );
}
