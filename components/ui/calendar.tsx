"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white select-none", className)}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: "w-fit",
        months: "flex flex-col sm:flex-row gap-6 relative",
        month: "flex flex-col gap-3 min-w-[250px]",
        nav: "flex items-center justify-between absolute top-1 inset-x-1 z-10 pointer-events-none",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-gray-100 rounded-full transition-all pointer-events-auto flex items-center justify-center cursor-pointer"
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-gray-100 rounded-full transition-all pointer-events-auto flex items-center justify-center cursor-pointer"
        ),
        month_caption: "flex items-center justify-center h-8 w-full text-center relative",
        caption_label: "text-sm font-bold text-gray-900",
        table: "w-full border-collapse",
        weekdays: "flex justify-between w-full mb-1",
        weekday: "text-gray-400 font-semibold text-[0.75rem] uppercase text-center w-9 h-8 flex items-center justify-center",
        week: "flex justify-between w-full mt-1",
        day: "relative p-0 text-center text-sm w-9 h-9 flex items-center justify-center",
        range_start: "rounded-l-xl bg-blue-50",
        range_middle: "rounded-none bg-blue-50/70",
        range_end: "rounded-r-xl bg-blue-50",
        today: "font-black text-[#1E3A8A]",
        outside: "text-gray-300 opacity-40 aria-selected:opacity-60",
        disabled: "text-gray-300 opacity-30 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...rootProps}
            />
          )
        },
        Chevron: ({ className, orientation, ...chevronProps }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("w-4 h-4 text-gray-700", className)} {...chevronProps} />
            )
          }
          return (
            <ChevronRightIcon className={cn("w-4 h-4 text-gray-700", className)} {...chevronProps} />
          )
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const isSelectedSingle = modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
  const isRangeEndpoint = modifiers.range_start || modifiers.range_end

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelectedSingle}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "h-9 w-9 p-0 font-medium text-sm rounded-xl transition-all duration-150 flex items-center justify-center",
        // Default hover
        "hover:bg-blue-50 hover:text-blue-900",
        // Single selection
        isSelectedSingle && "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A] hover:text-white font-bold shadow-md shadow-blue-900/20",
        // Range start
        modifiers.range_start && "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A] hover:text-white font-bold rounded-l-xl rounded-r-none shadow-md shadow-blue-900/20 z-10",
        // Range end
        modifiers.range_end && "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A] hover:text-white font-bold rounded-r-xl rounded-l-none shadow-md shadow-blue-900/20 z-10",
        // Range middle
        modifiers.range_middle && "bg-blue-100 text-blue-900 hover:bg-blue-200 rounded-none font-semibold",
        // Today ring
        modifiers.today && !modifiers.selected && "border-2 border-[#38BDF8] text-[#1E3A8A] font-bold",
        // Disabled
        modifiers.disabled && "text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-300",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
