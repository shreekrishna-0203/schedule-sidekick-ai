
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendees: string;
    description?: string;
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !start || !end) return;
    onSave({
      title,
      startTime: new Date(start),
      endTime: new Date(end),
      attendees,
      description,
    });
  };

  React.useEffect(() => {
    if (open && date) {
      setStart(`${date.toISOString().slice(0, 10)}T09:00`);
      setEnd(`${date.toISOString().slice(0, 10)}T10:00`);
    }
    if (!open) {
      setTitle("");
      setAttendees("");
      setDescription("");
    }
  }, [open, date]);

  return (
    <Dialog open={open} onOpenChange={open ? onClose : undefined}>
      <DialogContent>
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
            <Input id="event-description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
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
