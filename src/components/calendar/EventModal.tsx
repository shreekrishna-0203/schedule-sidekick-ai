
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendees: string;
    description?: string;
    isVirtual?: boolean;
    location?: string;
  }) => void;
  date: Date | undefined;
  isLoading?: boolean;
}

const EventModal: React.FC<EventModalProps> = ({ open, onClose, onSave, date, isLoading }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState<string>(date ? `${date.toISOString().slice(0, 10)}T09:00` : "");
  const [end, setEnd] = useState<string>(date ? `${date.toISOString().slice(0, 10)}T10:00` : "");
  const [attendees, setAttendees] = useState("");
  const [description, setDescription] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [location, setLocation] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !start || !end) return;
    onSave({
      title,
      startTime: new Date(start),
      endTime: new Date(end),
      attendees,
      description,
      isVirtual,
      location: isVirtual ? "" : location,
    });
  };

  React.useEffect(() => {
    if (open && date) {
      setStart(`${date.toISOString().slice(0, 10)}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
      
      // Set end time 1 hour after start by default
      const endDate = new Date(date);
      endDate.setHours(endDate.getHours() + 1);
      setEnd(`${endDate.toISOString().slice(0, 10)}T${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`);
    }
    if (!open) {
      setTitle("");
      setAttendees("");
      setDescription("");
      setIsVirtual(false);
      setLocation("");
    }
  }, [open, date]);

  return (
    <Dialog open={open} onOpenChange={open ? onClose : undefined}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="event-title">Title</Label>
            <Input id="event-title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="event-start">Start Time</Label>
              <Input id="event-start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
            </div>
            <div className="flex-1">
              <Label htmlFor="event-end">End Time</Label>
              <Input id="event-end" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
            </div>
          </div>
          <div>
            <Label htmlFor="event-attendees">Attendees</Label>
            <Input id="event-attendees" placeholder="Comma separated" value={attendees} onChange={e => setAttendees(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="event-description">Description</Label>
            <Textarea id="event-description" value={description} onChange={e => setDescription(e.target.value)} className="resize-none min-h-[80px]" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-virtual" checked={isVirtual} onCheckedChange={(checked) => setIsVirtual(checked === true)} />
            <Label htmlFor="is-virtual" className="cursor-pointer">Virtual meeting</Label>
          </div>
          {!isVirtual && (
            <div>
              <Label htmlFor="event-location">Location</Label>
              <Input id="event-location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Meeting location" />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
