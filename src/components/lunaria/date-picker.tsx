import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { todayISO } from "@/lib/data";
export function DatePicker({
  value,
  onChange,
  label = "Choose date",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const date = value ? new Date(`${value}T00:00:00`) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-label={label} className="w-full justify-start">
          <CalendarDays />
          {date ? format(date, "d MMMM yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && onChange(todayISO(d))}
          {...(date ? { defaultMonth: date } : {})}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={new Date(2100, 11)}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
