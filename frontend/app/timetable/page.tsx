'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { ClassSlot } from '@/types';
import { Clock, Plus, MapPin, User, Trash2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function Timetable() {
  const { classes = [], addClass, setClasses } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: '',
    day: '',
    startTime: '',
    endTime: '',
    room: '',
    professor: '',
  });

  const handleAddClass = () => {
    if (!newClass.subject || !newClass.day || !newClass.startTime || !newClass.endTime) return;

    const classSlot: ClassSlot = {
      id: Date.now().toString(),
      subject: newClass.subject,
      day: newClass.day,
      startTime: newClass.startTime,
      endTime: newClass.endTime,
      room: newClass.room,
      professor: newClass.professor,
    };

    addClass(classSlot);
    setNewClass({ subject: '', day: '', startTime: '', endTime: '', room: '', professor: '' });
    setIsDialogOpen(false);
  };

  const deleteClass = (id: string) => {
    const updatedClasses = classes.filter(cls => cls.id !== id);
    setClasses(updatedClasses);
  };

  return (
    <div className="relative min-h-screen">
      {/* ✅ Full-Screen Faded Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/aaa.jpg"
          alt="Classroom Background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* Page Content */}
      <div className="relative z-10 space-y-8 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Timetable</h1>
            <p className="text-gray-700">Manage your weekly class schedule.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newClass.subject}
                    onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics..."
                  />
                </div>

                <div>
                  <Label>Day</Label>
                  <Select value={newClass.day} onValueChange={(value) => setNewClass({ ...newClass, day: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Select value={newClass.startTime} onValueChange={(value) => setNewClass({ ...newClass, startTime: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>End Time</Label>
                    <Select value={newClass.endTime} onValueChange={(value) => setNewClass({ ...newClass, endTime: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="room">Room (Optional)</Label>
                  <Input
                    id="room"
                    value={newClass.room}
                    onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                    placeholder="e.g., Room 101, Lab A..."
                  />
                </div>

                <div>
                  <Label htmlFor="professor">Professor (Optional)</Label>
                  <Input
                    id="professor"
                    value={newClass.professor}
                    onChange={(e) => setNewClass({ ...newClass, professor: e.target.value })}
                    placeholder="Professor name..."
                  />
                </div>

                <Button onClick={handleAddClass} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Add Class
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {Array.isArray(classes) && classes.length > 0 ? (
          <Card className="bg-white/80 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classSlot) => (
                  <div key={classSlot.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white/90">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{classSlot.subject}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteClass(classSlot.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>{classSlot.day}</strong></p>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {classSlot.startTime} - {classSlot.endTime}
                      </div>
                      {classSlot.room && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {classSlot.room}
                        </div>
                      )}
                      {classSlot.professor && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {classSlot.professor}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/80 backdrop-blur-md text-center shadow-lg">
            <CardContent className="py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes scheduled</h3>
              <p className="text-gray-600 mb-6">Start by adding your first class to build your weekly timetable.</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Class
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
