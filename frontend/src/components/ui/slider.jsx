import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Shadcn-style Slider wrapping a native range input.
 * onValueChange receives [number] to match the spec's handleScoreChange signature.
 */
const Slider = React.forwardRef(({ className, value, onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
  const currentValue = Array.isArray(value) ? value[0] : (value ?? 0);

  const handleChange = (e) => {
    if (onValueChange) onValueChange([Number(e.target.value)]);
  };

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200',
          'accent-[--gov-accent]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[--gov-accent]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        {...props}
      />
    </div>
  );
});
Slider.displayName = 'Slider';

export { Slider };
