"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmButtonProps {
  message: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  children: React.ReactNode;
}

export function DeleteConfirmButton({
  message,
  className,
  variant = "destructive",
  size = "xs",
  children,
}: DeleteConfirmButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm(message)) {
      e.preventDefault();
    }
  };

  return (
    <Button
      type="submit"
      variant={variant}
      size={size as any}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
