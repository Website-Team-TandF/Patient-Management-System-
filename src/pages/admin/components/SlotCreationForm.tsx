import React, { useState } from 'react';
import { addDays, format, startOfDay, isAfter } from 'date-fns';
import { createSlots } from '../../../services/api';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleCalendar } from "@/components/ui/simple-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface SlotCreationFormProps {
  hospitalId: string;
  onSuccess: () => void;
}

const SlotCreationForm: React.FC<SlotCreationFormProps> = ({ hospitalId, onSuccess }) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [maxCapacity, setMaxCapacity] = useState(6);
  // Default to tomorrow since today's slots cannot be created
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(startOfDay(new Date()), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(startOfDay(new Date()), 1));
  
  const [loading, setLoading] = useState(false);

  // Constraints - slots can only be created from tomorrow onwards
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const maxDate = addDays(today, 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (isAfter(startDate, endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setLoading(true);

    try {
      const response = await createSlots(
        hospitalId, 
        parseInt(slotDuration), 
        maxCapacity, 
        startDate, 
        endDate, 
        startTime, 
        endTime
      );
      const slotCount = response?.data?.slotsCreated || 'some';
      toast.success(`Successfully generated ${slotCount} slots`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate slots');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Slots</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Slot Duration (minutes)</Label>
            <Select value={slotDuration} onValueChange={setSlotDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 mins</SelectItem>
                <SelectItem value="30">30 mins</SelectItem>
                <SelectItem value="45">45 mins</SelectItem>
                <SelectItem value="60">60 mins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Max Capacity per Slot</Label>
            <Input
              type="number"
              min="1"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
            />
          </div>
          
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <SimpleCalendar
                  selected={startDate}
                  onSelect={setStartDate}
                  minDate={tomorrow}
                  maxDate={maxDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <SimpleCalendar
                  selected={endDate}
                  onSelect={setEndDate}
                  minDate={startDate || tomorrow}
                  maxDate={maxDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Generating Slots...' : 'Generate Slots'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SlotCreationForm;
