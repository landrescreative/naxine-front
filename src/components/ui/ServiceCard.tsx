"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";

type ServiceCardProps = {
  title: string;
  image: string | StaticImageData;
  href?: string;
  className?: string;
};

export default function ServiceCard({
  title,
  image,
  href = "#",
  className = "",
}: ServiceCardProps) {
  return (
    <article
      className={`relative isolate aspect-square w-full overflow-hidden rounded-3xl shadow-lg ${className}`}
      aria-label={title}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        priority={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="mb-3 text-white text-lg sm:text-xl font-semibold drop-shadow-md">
          {title}
        </h3>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        >
          Ver más
        </Link>
      </div>

      <span className="pointer-events-none absolute inset-0 ring-1 ring-black/5" />
    </article>
  );
}
