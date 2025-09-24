'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext'; // keep if you have AppContext
import { Calendar, Plus, Bell, Trash2, Clock } from 'lucide-react';

/**
 * Local Event type to avoid external type import errors.
 * Structure matches what your UI expects.
 */
type EventType = {
  id: string;
  title: string;
  description?: string;
  date: string | Date;
  time?: string;
  type?: 'Exam' | 'Meeting' | 'Placement' | 'Deadline' | 'Other';
  location?: string;
  meetLink?: string;
  reminderEnabled?: boolean;
};

export default function EventsPage() {
  // try to use context if available, otherwise fallback to local behavior
  // note: calling useApp() unconditionally (hook rules). We will detect context values after.
  let appContext: any = null;
  try {
    appContext = useApp();
  } catch (e) {
    // if useApp hook is not defined or fails, we'll ignore and use local state
    appContext = null;
  }

  // Local events state (used even if context present, gets synced from context)
  const [localEvents, setLocalEvents] = useState<EventType[]>(
    (appContext && Array.isArray(appContext.events) ? appContext.events : []) as EventType[]
  );

  // local dialog and form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    type: 'Exam' as EventType['type'],
    location: '',
    meetLink: '',
    reminderEnabled: true,
  });

  // if context events update, sync local state
  useEffect(() => {
    if (appContext && Array.isArray(appContext.events)) {
      setLocalEvents(appContext.events);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appContext?.events]);

  // Add event helper — tries context addEvent else updates local state
  const addNewEvent = (ev: EventType) => {
    if (appContext && typeof appContext.addEvent === 'function') {
      try {
        appContext.addEvent(ev);
        // context likely updates localEvents via effect above
        return;
      } catch (err) {
        console.warn('context addEvent failed, falling back to local state', err);
      }
    }
    setLocalEvents((prev) => [...prev, ev]);
  };

  // Delete event helper
  const deleteExistingEvent = (id: string) => {
    if (appContext && typeof appContext.deleteEvent === 'function') {
      try {
        appContext.deleteEvent(id);
        return;
      } catch (err) {
        console.warn('context deleteEvent failed, falling back to local state', err);
      }
    }
    setLocalEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Handler for Add Event button inside the dialog
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const event: EventType = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: new Date(newEvent.date).toISOString(),
      time: newEvent.time,
      type: newEvent.type,
      location: newEvent.location,
      meetLink: newEvent.meetLink,
      reminderEnabled: newEvent.reminderEnabled,
    };

    addNewEvent(event);

    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '09:00',
      type: 'Exam',
      location: '',
      meetLink: '',
      reminderEnabled: true,
    });
    setIsDialogOpen(false);
  };

  // Derived arrays (safe: localEvents is always an array)
  const upcomingEvents = localEvents.filter((ev) => {
    // convert both to date objects to compare
    const evDate = new Date(ev.date);
    const now = new Date();
    // keep events whose date >= now (today & future) — compare date+time if provided
    return evDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  });

  const pastEvents = localEvents.filter((ev) => {
    const evDate = new Date(ev.date);
    const now = new Date();
    return evDate < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  });

  // small utility for event card color — same as earlier logic
  const getEventTypeColor = (type?: string) => {
    switch (type) {
      case 'Exam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Placement':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Deadline':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex relative min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Background + blur overlay */}
      <div className="absolute inset-0">
        <img src="/images/aaa.jpg" alt="background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      </div>

      {/* Main content (z-10 above overlay) */}
      <main className="relative flex-1 ml-64 p-6 z-10 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Events</h1>
            <p className="text-gray-700">Track exams, meetings, placements, and deadlines with ease.</p>
          </div>

          {/* Add Event Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-white text-black border border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add New Event</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title..."
                  />
                </div>

                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-date">Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-time">Time</Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Event Type</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}
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
                </div>

                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g., Room 101"
                  />
                </div>

                <div>
                  <Label htmlFor="event-meet-link">Google Meet Link</Label>
                  <Input
                    id="event-meet-link"
                    value={newEvent.meetLink}
                    onChange={(e) => setNewEvent({ ...newEvent, meetLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-switch">Enable Reminders</Label>
                  <Switch
                    id="reminder-switch"
                    checked={newEvent.reminderEnabled}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, reminderEnabled: checked })}
                  />
                </div>

                <Button onClick={handleAddEvent} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{localEvents.length}</p>
                <p className="text-sm text-gray-700">Total Events</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-sm text-gray-700">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center">
              <Bell className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {localEvents.filter((e) => e.reminderEnabled).length}
                </p>
                <p className="text-sm text-gray-700">With Reminders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events List */}
        <div className="grid grid-cols-1 gap-4">
          {upcomingEvents.length === 0 ? (
            <Card className="bg-white/90 p-6">
              <p className="text-gray-600">No upcoming events.</p>
            </Card>
          ) : (
            upcomingEvents.map((ev) => (
              <Card key={ev.id} className="bg-white/90 p-4 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{ev.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(ev.date).toLocaleDateString()} {ev.time ? ` • ${ev.time}` : ''}
                    </p>
                    {ev.description && <p className="mt-2 text-sm text-gray-700">{ev.description}</p>}
                  </div>

                  <div className="flex items-start gap-2">
                    <div className={`px-2 py-1 rounded ${getEventTypeColor(ev.type)}`}>{ev.type}</div>
                    <Button variant="ghost" size="sm" onClick={() => deleteExistingEvent(ev.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Past Events (optional display) */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Past Events</h3>
          {pastEvents.length === 0 ? (
            <Card className="bg-white/90 p-4">
              <p className="text-gray-600">No past events.</p>
            </Card>
          ) : (
            pastEvents.map((ev) => (
              <Card key={ev.id} className="bg-white/90 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{ev.title}</h4>
                    <p className="text-xs text-gray-600">
                      {new Date(ev.date).toLocaleDateString()} {ev.time ? ` • ${ev.time}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded ${getEventTypeColor(ev.type)}`}>{ev.type}</div>
                    <Button variant="ghost" size="sm" onClick={() => deleteExistingEvent(ev.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
