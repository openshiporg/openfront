'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DateRangePicker } from './DateRangePicker';

export function DateRangePickerWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center justify-end">
      <DateRangePicker 
        onDateChange={(range) => {
          if (range?.from && range?.to) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('startDate', range.from.toISOString());
            params.set('endDate', range.to.toISOString());
            params.delete('period');
            router.push(`${pathname}?${params.toString()}`);
          }
        }}
      />
    </div>
  );
}