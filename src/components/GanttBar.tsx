import { useState } from "react";
import { Lane } from "./GanttChart";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { cn } from "@/lib/utils";

interface GanttBarProps {
  lane: Lane;
  startOffset: number;
  width: number;
  onUpdate: (id: string, updates: Partial<Lane>) => void;
}

export const GanttBar = ({ lane, startOffset, width, onUpdate }: GanttBarProps) => {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const handleStartDateChange = (date: Date | undefined) => {
    if (date && date <= lane.endDate) {
      onUpdate(lane.id, { startDate: date });
      setShowStartCalendar(false);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date && date >= lane.startDate) {
      onUpdate(lane.id, { endDate: date });
      setShowEndCalendar(false);
    }
  };

  return (
    <div
      className="absolute h-10 group"
      style={{
        left: `${startOffset * 40}px`,
        width: `${width * 40}px`,
      }}
    >
      {/* Main bar */}
      <div className={`h-full bg-${lane.color} rounded-full flex items-center justify-between px-4 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Start date picker */}
        <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full hover:bg-white/30 transition-colors z-10">
              <Calendar className="w-3 h-3" />
              {format(lane.startDate, "MMM d")}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={lane.startDate}
              onSelect={handleStartDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Progress percentage (optional) */}
        {width > 5 && (
          <div className="text-xs font-semibold text-white/90 z-10">
            {lane.name}
          </div>
        )}

        {/* End date picker */}
        <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full hover:bg-white/30 transition-colors z-10">
              <Calendar className="w-3 h-3" />
              {format(lane.endDate, "MMM d")}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={lane.endDate}
              onSelect={handleEndDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Hover tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-xs z-20">
        {format(lane.startDate, "MMM d, yyyy")} - {format(lane.endDate, "MMM d, yyyy")}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover rotate-45" />
      </div>
    </div>
  );
};
