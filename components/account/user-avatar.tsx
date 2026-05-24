"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

export function UserAvatar({
  name,
  email,
  imageUrl,
  size = "md",
  className,
}: {
  name?: string | null;
  email: string;
  imageUrl?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name, email);
  const showImage = imageUrl && !imageFailed;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-semibold text-secondary-foreground",
        sizeClasses[size],
        className,
      )}
      aria-label={`${name ?? email} profile image`}
      title={name ?? email}
    >
      {showImage ? (
        <Image
          src={imageUrl}
          alt=""
          width={96}
          height={96}
          unoptimized
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function getInitials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email.split("@")[0] || "User";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return initials || "U";
}
