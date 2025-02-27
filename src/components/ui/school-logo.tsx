
import React from "react";

interface SchoolLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SchoolLogo({ className = "", size = "md" }: SchoolLogoProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="/lovable-uploads/36d788e2-41e3-4117-b3c1-343dd41986e2.png"
        alt="Stanley Jon Odlum School Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}
