import { useState, useMemo } from "react";
import { TimelineHeader } from "./TimelineHeader";
import { LaneRow } from "./LaneRow";
import { Button } from "./ui/button";
import { Plus, Calendar } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { cn } from "@/lib/utils";

export interface Lane {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

const AVAILABLE_COLORS = [
  "gantt-purple",
  "gantt-purple-light",
  "gantt-purple-dark",
  "gantt-blue",
  "gantt-blue-light",
  "gantt-blue-dark",
  "gantt-violet",
  "gantt-sky",
];

export const GanttChart = () => {
  const [startMonth, setStartMonth] = useState<Date>(startOfMonth(new Date())); // Current month
  const [monthsToShow, setMonthsToShow] = useState<number>(3);
  const [lanes, setLanes] = useState<Lane[]>([
    {
      id: "1",
      name: "On-Site Meetings",
      description: "Initial stakeholder meetings",
      startDate: new Date(),
      endDate: addMonths(new Date(), 0.2),
      color: "gantt-blue",
    },
    {
      id: "2",
      name: "Group Discussions",
      description: "Team brainstorming sessions",
      startDate: addMonths(new Date(), 0.2),
      endDate: addMonths(new Date(), 0.4),
      color: "gantt-blue-dark",
    },
    {
      id: "3",
      name: "Documentation",
      description: "Project documentation phase",
      startDate: addMonths(new Date(), 0.4),
      endDate: addMonths(new Date(), 0.6),
      color: "gantt-purple-light",
    },
  ]);

  const addLane = () => {
    const newLane: Lane = {
      id: Date.now().toString(),
      name: "New Milestone",
      description: "Add description here",
      startDate: new Date(),
      endDate: addMonths(new Date(), 1),
      color: AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)],
    };
    setLanes([...lanes, newLane]);
  };

  const updateLane = (id: string, updates: Partial<Lane>) => {
    setLanes(lanes.map((lane) => (lane.id === id ? { ...lane, ...updates } : lane)));
  };

  const deleteLane = (id: string) => {
    setLanes(lanes.filter((lane) => lane.id !== id));
  };

  const reorderLanes = (fromIndex: number, toIndex: number) => {
    const newLanes = [...lanes];
    const [removed] = newLanes.splice(fromIndex, 1);
    newLanes.splice(toIndex, 0, removed);
    setLanes(newLanes);
  };

  const addMonth = () => {
    setMonthsToShow(monthsToShow + 1);
  };

  const removeMonth = () => {
    if (monthsToShow > 1) {
      setMonthsToShow(monthsToShow - 1);
    }
  };

  const moveStartMonth = (direction: "prev" | "next") => {
    setStartMonth(direction === "prev" ? subMonths(startMonth, 1) : addMonths(startMonth, 1));
  };

  // Calculate dynamic day width based on total days and available space
  const { dayWidth, timelineWidth } = useMemo(() => {
    const months = Array.from({ length: monthsToShow }, (_, i) => addMonths(startMonth, i));
    const totalDays = months.reduce((acc, month) => {
      const days = eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month),
      });
      return acc + days.length;
    }, 0);
    
    // Calculate using 100% of viewport width
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1600;
    const laneColumnWidth = 320; // Fixed width for the task column
    const padding = 64; // Total horizontal padding (32px on each side from p-8)
    const availableWidth = viewportWidth - laneColumnWidth - padding;
    
    // Calculate day width to fit exactly in available space (minimum 15px for readability)
    const calculatedDayWidth = Math.max(15, Math.floor(availableWidth / totalDays));
    
    return {
      dayWidth: calculatedDayWidth,
      timelineWidth: totalDays * calculatedDayWidth
    };
  }, [startMonth, monthsToShow]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="w-full mx-auto space-y-6">{/* Removed max-w to use full viewport */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Project Gantt Timeline</h1>
            <p className="text-muted-foreground">Plan and track your project milestones</p>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(startMonth, "MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={startMonth}
                  onSelect={(date) => date && setStartMonth(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={removeMonth} variant="outline" disabled={monthsToShow <= 1}>
              - Month
            </Button>
            <Button onClick={addMonth} variant="outline">
              + Month
            </Button>
            <Button onClick={addLane} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Lane
            </Button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="w-full overflow-hidden">{/* Always use full width, prevent scroll */}
            <TimelineHeader startMonth={startMonth} monthsToShow={monthsToShow} dayWidth={dayWidth} />
            <div className="bg-gantt-bg">
              {lanes.map((lane, index) => (
                <LaneRow
                  key={lane.id}
                  lane={lane}
                  index={index}
                  totalLanes={lanes.length}
                  startMonth={startMonth}
                  monthsToShow={monthsToShow}
                  dayWidth={dayWidth}
                  onUpdate={updateLane}
                  onDelete={deleteLane}
                  onReorder={reorderLanes}
                  availableColors={AVAILABLE_COLORS}
                />
              ))}
              {lanes.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="text-lg">No milestones yet. Click "Add Lane" to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
