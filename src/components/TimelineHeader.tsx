import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";

interface TimelineHeaderProps {
  startMonth: Date;
  monthsToShow: number;
  dayWidth: number;
}

export const TimelineHeader = ({ startMonth, monthsToShow, dayWidth }: TimelineHeaderProps) => {
  const months = Array.from({ length: monthsToShow }, (_, i) => addMonths(startMonth, i));
  
  // Calculate all weeks across the entire timeline (7-day weeks that can span months)
  const timelineStart = startOfMonth(startMonth);
  const timelineEnd = endOfMonth(months[months.length - 1]);
  const allWeeks: { start: Date; end: Date; weekNumber: number }[] = [];
  
  let currentWeekStart = startOfWeek(timelineStart, { weekStartsOn: 1 });
  let weekCounter = 1;
  
  while (currentWeekStart <= timelineEnd) {
    const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    allWeeks.push({
      start: currentWeekStart,
      end: currentWeekEnd,
      weekNumber: weekCounter
    });
    currentWeekStart = new Date(currentWeekEnd);
    currentWeekStart.setDate(currentWeekStart.getDate() + 1);
    weekCounter++;
  }

  return (
    <div className="bg-card border-b border-border">
      {/* Months Row */}
      <div className="flex border-b border-border">
        <div className="w-80 shrink-0 px-6 py-4 font-semibold text-foreground bg-muted/30">
          Task / Phase
        </div>
        <div className="flex flex-1 overflow-hidden">
          {months.map((month, idx) => {
            const daysInMonth = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month),
            }).length;
            
            const monthWidth = daysInMonth * dayWidth;
            
            return (
              <div
                key={idx}
                className="py-4 text-center font-semibold text-foreground bg-muted/20 shrink-0"
                style={{ 
                  width: `${monthWidth}px`,
                  borderRadius: `${Math.min(monthWidth / 2, 50)}px`,
                  marginLeft: idx === 0 ? '0' : '4px',
                  marginRight: idx === months.length - 1 ? '0' : '4px'
                }}
              >
                {format(month, "MMMM yyyy")}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weeks Row - 7-day weeks spanning across months */}
      <div className="flex border-b border-border">
        <div className="w-80 shrink-0 px-6 py-3 text-sm font-medium text-muted-foreground bg-muted/20">
          Description
        </div>
        <div className="flex flex-1 overflow-hidden">
          {allWeeks.map((week, idx) => {
            // Calculate how many days of this week are visible in our timeline
            const visibleStart = week.start < timelineStart ? timelineStart : week.start;
            const visibleEnd = week.end > timelineEnd ? timelineEnd : week.end;
            const visibleDays = eachDayOfInterval({ start: visibleStart, end: visibleEnd }).length;
            
            return (
              <div
                key={idx}
                className="px-2 py-3 text-center text-sm font-medium text-muted-foreground border-r border-gantt-grid shrink-0"
                style={{ width: `${visibleDays * dayWidth}px` }}
              >
                w{week.weekNumber}
              </div>
            );
          })}
        </div>
      </div>

      {/* Days Row */}
      <div className="flex">
        <div className="w-80 shrink-0 px-6 py-3 text-sm font-medium text-muted-foreground bg-muted/10">
          Duration
        </div>
        <div className="flex flex-1 overflow-hidden">
          {months.map((month, monthIdx) => {
            const days = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month),
            });

            return (
              <div key={monthIdx} className="flex shrink-0">
                {days.map((day, dayIdx) => {
                  const showDayInitials = monthsToShow >= 3;
                  const dayLabel = showDayInitials 
                    ? format(day, "EEEEE") // Single letter day (M, T, W, T, F, S, S)
                    : format(day, "d"); // Day number
                  
                  // Dynamic font size based on dayWidth
                  const fontSize = dayWidth < 20 ? '0.625rem' : dayWidth < 30 ? '0.75rem' : '0.875rem';
                  
                  return (
                    <div
                      key={dayIdx}
                      className="px-1 py-3 text-center font-medium text-muted-foreground border-l border-gantt-grid first:border-l-0 shrink-0"
                      style={{ 
                        width: `${dayWidth}px`,
                        fontSize: fontSize
                      }}
                    >
                      {dayLabel}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
