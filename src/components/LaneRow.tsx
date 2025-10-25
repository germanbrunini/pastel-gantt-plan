import { useState } from "react";
import { Lane } from "./GanttChart";
import { GanttBar } from "./GanttBar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Trash2, GripVertical, Check, X, Edit2, Palette } from "lucide-react";
import { startOfMonth, eachDayOfInterval, endOfMonth, addMonths, differenceInDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface LaneRowProps {
  lane: Lane;
  index: number;
  totalLanes: number;
  startMonth: Date;
  monthsToShow: number;
  onUpdate: (id: string, updates: Partial<Lane>) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  availableColors: string[];
}

export const LaneRow = ({
  lane,
  index,
  totalLanes,
  startMonth,
  monthsToShow,
  onUpdate,
  onDelete,
  onReorder,
  availableColors,
}: LaneRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(lane.name);
  const [editDescription, setEditDescription] = useState(lane.description);

  const handleSave = () => {
    onUpdate(lane.id, { name: editName, description: editDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(lane.name);
    setEditDescription(lane.description);
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (fromIndex !== index) {
      onReorder(fromIndex, index);
    }
  };

  // Calculate total days to show
  const endMonth = addMonths(startMonth, monthsToShow - 1);
  const totalDays = eachDayOfInterval({
    start: startOfMonth(startMonth),
    end: endOfMonth(endMonth),
  }).length;

  // Calculate bar position and width
  const timelineStart = startOfMonth(startMonth);
  const barStartOffset = Math.max(0, differenceInDays(lane.startDate, timelineStart));
  const barWidth = differenceInDays(lane.endDate, lane.startDate) + 1;

  return (
    <div
      className="flex border-b border-gantt-grid hover:bg-muted/10 transition-colors group"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Left sidebar with lane info */}
      <div className="w-80 shrink-0 px-4 py-4 flex items-center gap-3 border-r border-gantt-grid">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-grab active:cursor-grabbing p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </Button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-sm"
                placeholder="Milestone name"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="text-xs resize-none h-16"
                placeholder="Description"
              />
              <div className="flex gap-1">
                <Button onClick={handleSave} size="sm" className="h-7 px-2">
                  <Check className="w-3 h-3" />
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="h-7 px-2">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="font-medium text-foreground text-sm">{lane.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{lane.description}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Palette className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <div className="grid grid-cols-4 gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdate(lane.id, { color })}
                    className={`w-8 h-8 rounded-full bg-${color} hover:scale-110 transition-transform ${
                      lane.color === color ? "ring-2 ring-foreground ring-offset-2" : ""
                    }`}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => onDelete(lane.id)}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Timeline area */}
      <div className="flex-1 relative py-6" style={{ width: `${totalDays * 40}px` }}>
        <GanttBar
          lane={lane}
          startOffset={barStartOffset}
          width={barWidth}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};
