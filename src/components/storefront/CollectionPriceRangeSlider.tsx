import { useCallback, useId, useRef } from "react";
import { cn } from "@/lib/utils";

const formatInr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const snapToStep = (value: number, min: number, max: number, step: number) => {
  const snapped = Math.round(value / step) * step;
  return clamp(snapped, min, max);
};

type CollectionPriceRangeSliderProps = {
  boundsMin: number;
  boundsMax: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  className?: string;
};

export function CollectionPriceRangeSlider({
  boundsMin,
  boundsMax,
  valueMin,
  valueMax,
  onChange,
  className,
}: CollectionPriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const step = boundsMax - boundsMin > 5000 ? 500 : 100;
  const range = boundsMax - boundsMin || 1;

  const minPercent = ((valueMin - boundsMin) / range) * 100;
  const maxPercent = ((valueMax - boundsMin) / range) * 100;

  const valueFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return boundsMin;
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return snapToStep(boundsMin + ratio * range, boundsMin, boundsMax, step);
    },
    [boundsMin, boundsMax, range, step],
  );

  const startDrag = (thumb: "min" | "max") => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const next = valueFromPointer(moveEvent.clientX);
      if (thumb === "min") {
        onChange(clamp(next, boundsMin, valueMax - step), valueMax);
      } else {
        onChange(valueMin, clamp(next, valueMin + step, boundsMax));
      }
    };

    const onUp = () => {
      target.releasePointerCapture(event.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const onTrackClick = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button[role="slider"]')) return;
    const next = valueFromPointer(event.clientX);
    const distToMin = Math.abs(next - valueMin);
    const distToMax = Math.abs(next - valueMax);
    if (distToMin <= distToMax) {
      onChange(clamp(next, boundsMin, valueMax - step), valueMax);
    } else {
      onChange(valueMin, clamp(next, valueMin + step, boundsMax));
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <p
        id={labelId}
        className="font-store-display text-2xl text-[var(--store-ink)] md:text-3xl"
      >
        {formatInr(valueMin)}
        <span className="mx-3 text-[var(--store-red-dark)]" aria-hidden>
          —
        </span>
        {formatInr(valueMax)}
      </p>

      <div
        ref={trackRef}
        role="group"
        aria-labelledby={labelId}
        className="relative h-10 cursor-pointer touch-none select-none"
        onPointerDown={onTrackClick}
      >
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-[var(--store-red)]"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <button
          type="button"
          role="slider"
          aria-label="Minimum price"
          aria-valuemin={boundsMin}
          aria-valuemax={valueMax}
          aria-valuenow={valueMin}
          aria-valuetext={formatInr(valueMin)}
          className="absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--store-red-dark)] bg-white shadow-[0_0_0_4px_rgba(184,149,74,0.12)] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-red)]"
          style={{ left: `${minPercent}%` }}
          onPointerDown={startDrag("min")}
        />
        <button
          type="button"
          role="slider"
          aria-label="Maximum price"
          aria-valuemin={valueMin}
          aria-valuemax={boundsMax}
          aria-valuenow={valueMax}
          aria-valuetext={formatInr(valueMax)}
          className="absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--store-red-dark)] bg-white shadow-[0_0_0_4px_rgba(184,149,74,0.12)] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-red)]"
          style={{ left: `${maxPercent}%` }}
          onPointerDown={startDrag("max")}
        />
      </div>
    </div>
  );
}
