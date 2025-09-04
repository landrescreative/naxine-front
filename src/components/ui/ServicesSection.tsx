"use client";

import React, { useEffect, useRef, useState } from "react";
import ServiceCard from "./ServiceCard";
import { StaticImageData } from "next/image";

type ServiceItem = {
  title: string;
  image: string | StaticImageData;
  href?: string;
};

type ServicesSectionProps = {
  items: ServiceItem[];
  className?: string;
};

export default function ServicesSection({
  items,
  className = "",
}: ServicesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [colWidth, setColWidth] = useState(0);
  const [gapX, setGapX] = useState(24); // default ~ gap-6
  const [numPages, setNumPages] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  // medir ancho de columna y separación para los dots/scroll
  useEffect(() => {
    const measure = () => {
      if (!gridRef.current || !scrollRef.current) return;
      const firstCard = gridRef.current.querySelector<HTMLElement>("article");
      if (firstCard) setColWidth(firstCard.offsetWidth);
      const styles = window.getComputedStyle(gridRef.current);
      const gap = parseFloat(styles.columnGap || "24");
      const gapValue = isNaN(gap) ? 24 : gap;
      setGapX(gapValue);
      const cw = scrollRef.current.clientWidth;
      setContainerWidth(cw);
      const totalWidth = scrollRef.current.scrollWidth;
      const pages = Math.min(3, Math.max(1, Math.ceil(totalWidth / cw)));
      setNumPages(pages);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(event.clientX);
    setScrollStart(scrollRef.current.scrollLeft);
    lastXRef.current = event.clientX;
    velocityRef.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    const deltaX = event.clientX - startX;
    scrollRef.current.scrollLeft = scrollStart - deltaX;

    // calcular velocidad para inercia
    const dx = event.clientX - lastXRef.current;
    velocityRef.current = dx; // px por frame (aprox)
    lastXRef.current = event.clientX;
  };

  const endDrag = () => {
    if (!scrollRef.current) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    // inercia al soltar
    const friction = 0.93; // 0-1, más bajo = se detiene antes
    const step = () => {
      if (!scrollRef.current) return;
      if (Math.abs(velocityRef.current) < 0.2) {
        rafRef.current = null;
        return;
      }
      scrollRef.current.scrollLeft -= velocityRef.current;
      velocityRef.current *= friction;
      rafRef.current = requestAnimationFrame(step);
    };

    // solo aplica si hubo cierto movimiento
    if (Math.abs(velocityRef.current) > 0.5) {
      rafRef.current = requestAnimationFrame(step);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current || colWidth === 0) return;
    const idx = Math.round(scrollRef.current.scrollLeft / (colWidth + gapX));
    const maxIdx = Math.max(
      0,
      Math.ceil(scrollRef.current.scrollWidth / (containerWidth || 1)) - 1
    );
    const clamped = Math.max(0, Math.min(Math.min(numPages - 1, maxIdx), idx));
    setActiveIndex(clamped);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const perPage = containerWidth;
    const target = Math.min(
      scrollRef.current.scrollWidth - perPage,
      index * perPage
    );
    scrollRef.current.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <section className={`w-full pl-2 md:pl-10 py-4 sm:py-6 ${className}`}>
      <div className="relative">
        <div
          ref={scrollRef}
          className={`overflow-x-auto overscroll-x-contain hide-scrollbar snap-x snap-mandatory scroll-smooth ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onScroll={handleScroll}
        >
          <div
            ref={gridRef}
            className="grid grid-rows-2 grid-flow-col px-4 sm:px-6 lg:px-8 gap-x-5 gap-y-6 sm:gap-x-8 sm:gap-y-8 md:gap-x-10 md:gap-y-10 auto-cols-[80vw] sm:auto-cols-[minmax(240px,280px)] md:auto-cols-[minmax(260px,320px)] lg:auto-cols-[minmax(300px,360px)]"
            role="list"
            aria-label="Servicios"
          >
            {items.map((item, index) => (
              <ServiceCard
                key={`${item.title}-${index}`}
                title={item.title}
                image={item.image}
                href={item.href}
                className="w-full snap-start"
              />
            ))}
          </div>
        </div>
        {/* indicadores de posición */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: numPages }).map((_, i) => (
            <button
              key={i}
              aria-label={`Ir a página ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === activeIndex ? "bg-primary" : "bg-gray-300"
              }`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none; /* IE/Edge */
            scrollbar-width: none; /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
          }
        `}</style>
      </div>
    </section>
  );
}
