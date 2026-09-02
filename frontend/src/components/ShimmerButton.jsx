/**
 * Magic UI — Shimmer Button
 * Source: github.com/magicuidesign/magicui — registry/magicui/shimmer-button.tsx
 * MIT License. Animation logic preserved exactly; background token adapted to
 * GovLaunch's --gov-accent teal for the 3 high-stakes CTA buttons only (per spec Block M2).
 *
 * Apply ONLY to:
 *   1. "Publish Challenge" (PostChallenge review step)
 *   2. "Submit Application" (ApplyToChallenge form)
 *   3. "Finalize & Generate PDF" (GenerateContract screen)
 */
import React from 'react';
import { cn } from '../lib/utils';

export const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      borderRadius = '8px',
      background = 'rgba(15, 118, 110, 1)', // --gov-accent teal
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={{
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        }}
        className={cn(
          // Layout + shape
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap',
          '[border-radius:var(--radius)] border border-white/10 px-6 py-2.5 text-sm font-medium text-white',
          '[background:var(--bg)]',
          // Micro-interaction
          'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container */}
        <div className="-z-30 blur-[2px] absolute inset-0 overflow-hidden [container-type:size]">
          {/* Spinning conic gradient that creates the shimmer sweep */}
          <div className="absolute inset-0 h-[100cqh] [aspect-ratio:1] rounded-none [mask:none] animate-[shimmer-slide_var(--speed)_ease-in-out_infinite_alternate]">
            <div className="absolute -inset-full w-auto rotate-0 animate-[spin-around_calc(var(--speed)*2)_linear_infinite] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>

        {children}

        {/* Inner highlight */}
        <div
          className={cn(
            'absolute inset-0 size-full rounded-[inherit] px-4 py-1.5',
            'shadow-[inset_0_-8px_10px_#ffffff1f]',
            'transform-gpu transition-all duration-300 ease-in-out',
            'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
            'group-active:shadow-[inset_0_-10px_10px_#ffffff3f]'
          )}
        />

        {/* Backdrop that masks spark behind button face */}
        <div className="absolute -z-20 [border-radius:var(--radius)] [background:var(--bg)]" style={{ inset: 'var(--cut)' }} />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';