'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Trash2, Clock } from 'lucide-react';

type EventType = {
  _id?: string;
  title: string;
  description?: string;
  dateTime: string;
  time?: string;
  type?: 'Exam' | 'Meeting' | 'Placement' | 'Deadline' | 'Other';
  location?: string;
  meetLink?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    type: 'Exam' as EventType['type'],
    location: '',
    meetLink: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(
          data.map((ev: any) => ({
            ...ev,
            dateTime: ev.dateTime ? new Date(ev.dateTime).toISOString() : '',
          }))
        );
      } catch (err) {
        console.error('Fetch events error:', err);
      }
    })();
  }, []);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    try {
      const body = { ...newEvent, date: newEvent.date };
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown' }));
        console.error('Create event error', err);
        return;
      }
      const created = await res.json();
      setEvents((prev) => [
        ...prev,
        { ...created, dateTime: created.dateTime ? new Date(created.dateTime).toISOString() : '' },
      ]);
      setIsDialogOpen(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '09:00',
        type: 'Exam',
        location: '',
        meetLink: '',
      });
    } catch (err) {
      console.error('Add event error:', err);
    }
  };

  const handleDeleteEvent = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });
      if (!res.ok) {
        console.error('Delete failed', await res.text());
        return;
      }
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
    } catch (err) {
      console.error('Delete event error:', err);
    }
  };

  const upcoming = events.filter((ev) => new Date(ev.dateTime) >= new Date());
  const past = events.filter((ev) => new Date(ev.dateTime) < new Date());

  return (
    <div className="flex relative min-h-screen">
      <Sidebar />

      <div className="absolute inset-0">
        <img src="/images/aaa.jpg" alt="background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />
      </div>

      <main className="relative flex-1 ml-64 p-6 z-10 space-y-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Events</h1>
            <p className="text-gray-700">Track exams, meetings, placements, and deadlines with ease.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white text-black border border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label>Title</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title..."
                />
                <Label>Description</Label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={(newEvent as any).date || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <Label>Event Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(val) => setNewEvent({ ...newEvent, type: val as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Exam">Exam</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Placement">Placement</SelectItem>
                    <SelectItem value="Deadline">Deadline</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Label>Location</Label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
                <Label>Meet Link</Label>
                <Input
                  value={newEvent.meetLink}
                  onChange={(e) => setNewEvent({ ...newEvent, meetLink: e.target.value })}
                />
                <Button
                  onClick={handleAddEvent}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-gray-700">Total Events</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{upcoming.length}</p>
                <p className="text-sm text-gray-700">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          {upcoming.length === 0 ? (
            <Card className="bg-white/90 p-6">
              <p className="text-gray-600">No upcoming events.</p>
            </Card>
          ) : (
            upcoming.map((ev) => (
              <Card
                key={ev._id}
                className="bg-white/90 p-4 hover:shadow-md flex justify-between items-start"
              >
                <div>
                  <h3 className="text-lg font-semibold">{ev.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(ev.dateTime).toLocaleDateString()} {ev.time ? `• ${ev.time}` : ''}
                  </p>
                  {ev.description && <p className="mt-2 text-sm text-gray-700">{ev.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded bg-gray-100 text-sm">{ev.type}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(ev._id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Past */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past Events</h2>
          {past.length === 0 ? (
            <Card className="bg-white/90 p-6">
              <p className="text-gray-600">No past events.</p>
            </Card>
          ) : (
            past.map((ev) => (
              <Card key={ev._id} className="bg-white/90 p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{ev.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(ev.dateTime).toLocaleDateString()} {ev.time ? `• ${ev.time}` : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEvent(ev._id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
