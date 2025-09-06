'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { Event } from '@/types';
import { Calendar, Plus, Bell, MapPin, ExternalLink, Trash2, Clock } from 'lucide-react';

export default function Events() {
  const { events = [], addEvent, deleteEvent } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    type: 'Exam' as Event['type'],
    location: '',
    meetLink: '',
    reminderEnabled: true,
  });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: new Date(newEvent.date),
      time: newEvent.time,
      type: newEvent.type,
      location: newEvent.location,
      meetLink: newEvent.meetLink,
      reminderEnabled: newEvent.reminderEnabled,
    };

    addEvent(event);
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Exam': return 'bg-red-100 text-red-800 border-red-200';
      case 'Meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Placement': return 'bg-green-100 text-green-800 border-green-200';
      case 'Deadline': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());

  const isToday = (date: Date) =>
    new Date().toDateString() === new Date(date).toDateString();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-black p-6"
      style={{ backgroundImage: "url('/images/aaa.jpg')" }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

      {/* Main Content */}
      <div className="relative z-10 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Events</h1>
            <p className="text-gray-700">Track exams, meetings, placements, and deadlines with ease.</p>
          </div>

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
                    onValueChange={(value: Event['type']) => setNewEvent({ ...newEvent, type: value })}
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
                    onCheckedChange={(checked) =>
                      setNewEvent({ ...newEvent, reminderEnabled: checked })
                    }
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
          <Card>
            <CardContent className="p-6 flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-gray-700">Total Events</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-sm text-gray-700">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <Bell className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{events.filter(e => e.reminderEnabled).length}</p>
                <p className="text-sm text-gray-700">With Reminders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming and Past Events */}
        {/* You can keep the same mapping blocks here */}
      </div>
    </div>
  );
}
