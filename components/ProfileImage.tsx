"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  size?: number;
  fallbackText?: string;
}

export function ProfileImage({
  src,
  alt,
  className,
  size = 40,
  fallbackText,
}: ProfileImageProps) {
  const [error, setError] = useState(false);

  // Generate fallback text from the first letter of alt
  const letter = fallbackText || alt?.[0] || "?";

  // Generate classes for the container
  const containerClasses = cn(
    "rounded-full bg-muted flex items-center justify-center overflow-hidden",
    className
  );

  // If there's no source or an error loading it, show the fallback
  if (!src || error) {
    return (
      <div
        className={containerClasses}
        style={{ width: size, height: size }}
      >
        <span className="text-muted-foreground font-bold" style={{ fontSize: size * 0.4 }}>
          {letter.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => setError(true)}
        referrerPolicy="no-referrer"
        unoptimized
      />
    </div>
  );
}
