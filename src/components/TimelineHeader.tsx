import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from "date-fns";

interface TimelineHeaderProps {
  startMonth: Date;
  monthsToShow: number;
}

export const TimelineHeader = ({ startMonth, monthsToShow }: TimelineHeaderProps) => {
  const months = Array.from({ length: monthsToShow }, (_, i) => addMonths(startMonth, i));

  return (
    <div className="bg-card border-b border-border">
      {/* Months Row */}
      <div className="flex border-b border-border">
        <div className="w-80 shrink-0 px-6 py-4 font-semibold text-foreground bg-muted/30">
          Task / Phase
        </div>
        <div className="flex flex-1">
          {months.map((month, idx) => {
            const daysInMonth = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month),
            }).length;
            
            return (
              <div
                key={idx}
                className="border-l border-border px-4 py-4 text-center font-semibold text-foreground"
                style={{ width: `${daysInMonth * 40}px` }}
              >
                {format(month, "MMMM yyyy")}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weeks Row */}
      <div className="flex border-b border-border">
        <div className="w-80 shrink-0 px-6 py-3 text-sm font-medium text-muted-foreground bg-muted/20">
          Description
        </div>
        <div className="flex flex-1">
          {months.map((month, monthIdx) => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const weeks = eachWeekOfInterval(
              { start: monthStart, end: monthEnd },
              { weekStartsOn: 1 }
            );

            return (
              <div key={monthIdx} className="flex border-l border-border">
                {weeks.map((week, weekIdx) => {
                  const weekStart = startOfWeek(week, { weekStartsOn: 1 });
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  
                  // Calculate days in this week that belong to current month
                  const daysInWeek = eachDayOfInterval({
                    start: weekStart > monthStart ? weekStart : monthStart,
                    end: weekEnd < monthEnd ? weekEnd : monthEnd,
                  }).length;

                  return (
                    <div
                      key={weekIdx}
                      className="px-2 py-3 text-center text-sm font-medium text-muted-foreground border-l border-gantt-grid first:border-l-0"
                      style={{ width: `${daysInWeek * 40}px` }}
                    >
                      w{weekIdx + 1}
                    </div>
                  );
                })}
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
        <div className="flex flex-1">
          {months.map((month, monthIdx) => {
            const days = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month),
            });

            return (
              <div key={monthIdx} className="flex border-l border-border">
                {days.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="w-[40px] px-1 py-3 text-center text-xs font-medium text-muted-foreground border-l border-gantt-grid first:border-l-0"
                  >
                    {format(day, "d")}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
