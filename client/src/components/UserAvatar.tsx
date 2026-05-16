"use client";
import { useState } from "react";

type Props = {
  photoURL?: string | null;
  name?: string | null;
  size?: string;
  className?: string;
};

export default function UserAvatar({ photoURL, name, size = "h-10 w-10", className = "" }: Props) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || "U").charAt(0).toUpperCase();

  if (photoURL && !imgError) {
    return (
      <img
        src={photoURL}
        alt=""
        className={`${size} shrink-0 rounded-full object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300 ${className}`}
    >
      {initial}
    </span>
  );
}
