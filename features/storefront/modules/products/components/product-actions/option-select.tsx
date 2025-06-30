"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check } from 'lucide-react'
import { onlyUnique } from "../../../../lib/util/only-unique";
import React from "react";

const SIZE_ORDER = {
  "XXS": 1, "XS": 2, "S": 3, "M": 4, "L": 5, "XL": 6, "XXL": 7, "XXXL": 8
};

type OptionSelectProps = {
  option: any;
  current: string | undefined;
  updateOption: (update: any) => void;
  title: string;
  disabled?: boolean;
  "data-testid"?: string;
};

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = option.productOptionValues
    .map((v: any) => v.value)
    .filter(onlyUnique)
    .sort((a: string, b: string) => {
      if (title.toLowerCase() === "size") {
        return (SIZE_ORDER[a as keyof typeof SIZE_ORDER] || 999) - (SIZE_ORDER[b as keyof typeof SIZE_ORDER] || 999);
      }
      return a.localeCompare(b);
    });

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div className="flex flex-wrap justify-start gap-3" data-testid={dataTestId}>
        {filteredOptions.map((v: any) => {
          const isSelected = current === v;
          return (
            <motion.button
              key={v}
              onClick={() => updateOption({ [option.id]: v })}
              disabled={disabled}
              initial={false}
              animate={{
                backgroundColor: isSelected ? "#2a1711" : "#ffffff",
              }}
              whileHover={{
                backgroundColor: isSelected ? "#2a1711" : "#f1f1f1",
              }}
              whileTap={{
                backgroundColor: isSelected ? "#1f1209" : "rgba(39, 39, 42, 0.9)",
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5,
                backgroundColor: { duration: 0.1 },
              }}
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                whitespace-nowrap overflow-hidden ring-1 ring-inset
                ${isSelected 
                  ? "text-primary-foreground ring-primary" 
                  : "text-muted-foreground ring-border"}
              `}
              data-testid="option-button"
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
                <span>{v}</span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30, 
                        mass: 0.5 
                      }}
                      className="absolute right-0"
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-primary-foreground flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary" strokeWidth={1.5} />
                      </div>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default OptionSelect;