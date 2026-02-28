import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  isAfter,
  startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ 
  selected, 
  onSelect, 
  minDate, 
  maxDate,
  className 
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selected || new Date()));

  const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const onPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between py-2 px-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onPrevMonth}
          disabled={minDate && isBefore(subMonths(currentMonth, 0), startOfMonth(minDate))}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onNextMonth}
          disabled={maxDate && isAfter(addMonths(currentMonth, 0), endOfMonth(maxDate))}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEEE";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-muted-foreground text-[0.8rem] font-normal w-9 text-center py-1">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="flex w-full justify-between mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        const isDisabled = (minDate && isBefore(day, startOfDay(minDate))) || 
                           (maxDate && isAfter(day, maxDate));
        
        const isSelected = selected && isSameDay(day, selected);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div key={day.toString()} className="p-0 relative">
            <Button
              variant="ghost"
              disabled={isDisabled}
              onClick={() => onSelect(cloneDay)}
              className={cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                !isSelected && isCurrentMonth && !isDisabled && "hover:bg-accent hover:text-accent-foreground",
                isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {formattedDate}
            </Button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="flex w-full justify-between mt-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex flex-col">{rows}</div>;
  };

  return (
    <div className={cn("p-3 w-auto bg-popover border rounded-md shadow-md", className)}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
