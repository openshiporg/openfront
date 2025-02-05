import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@keystone/utils/cn";

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

export function OptionButton({ option, isSelected, onClick }) {
  return (
    <motion.button
      key={option.id}
      onClick={onClick}
      layout
      initial={false}
      animate={{
        backgroundColor: isSelected
          ? "hsl(var(--primary))"
          : "transparent",
      }}
      whileHover={{
        backgroundColor: isSelected
          ? "hsl(var(--primary))"
          : "hsl(var(--muted))",
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        ...transitionProps,
        backgroundColor: { duration: 0.1 },
      }}
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium",
        "whitespace-nowrap overflow-hidden ring-1 ring-inset",
        isSelected
          ? "text-primary-foreground ring-primary"
          : "text-muted-foreground ring-border hover:text-foreground"
      )}
    >
      <motion.div
        className="relative flex items-center"
        animate={{
          width: isSelected ? "auto" : "100%",
          paddingRight: isSelected ? "1.5rem" : "0",
        }}
        transition={{
          ease: [0.175, 0.885, 0.32, 1.275],
          duration: 0.3,
        }}
      >
        <span>{option.label || option.title}</span>
        <AnimatePresence>
          {isSelected && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={transitionProps}
              className="absolute right-0"
            >
              <div className="w-4 h-4 rounded-full bg-primary-foreground flex items-center justify-center">
                <Check
                  className="w-3 h-3 text-primary"
                  strokeWidth={1.5}
                />
              </div>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
} 