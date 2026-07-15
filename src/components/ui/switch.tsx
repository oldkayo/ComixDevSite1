"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onCheckedChange(!checked);
        }}
        className={cn(
          "relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-neon-cyan" : "bg-gray-800",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "-translate-x-4.5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
