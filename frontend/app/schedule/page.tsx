'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { BookOpen, Plus, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Subject = {
  _id: string;
  name: string;
  color: string;
  totalModules: number;
  completedModules: number;
};

type Module = {
  _id: string;
  subjectId: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  completed: boolean;
};

export default function SchedulePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3B82F6' });
  const [newModule, setNewModule] = useState({ name: '', subjectId: '', difficulty: 'Medium', estimatedHours: 2 });

  // Fetch
  useEffect(() => {
    const fetchData = async () => {
      const [s, m] = await Promise.all([fetch('/api/schedule/subjects'), fetch('/api/schedule/modules')]);
      if (s.ok) setSubjects(await s.json());
      if (m.ok) setModules(await m.json());
    };
    fetchData();
  }, []);

  const addSubject = async () => {
    const res = await fetch('/api/schedule/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubject),
    });
    if (res.ok) {
      const created = await res.json();
      setSubjects([...subjects, created]);
      setNewSubject({ name: '', color: '#3B82F6' });
    }
  };

  const addModule = async () => {
    if (!newModule.name || !newModule.subjectId) return;
    const res = await fetch('/api/schedule/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newModule),
    });
    if (res.ok) {
      const created = await res.json();
      setModules([...modules, created]);
      setNewModule({ name: '', subjectId: '', difficulty: 'Medium', estimatedHours: 2 });
    }
  };

  const toggleCompletion = async (id: string, current: boolean) => {
    const res = await fetch('/api/schedule/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed: !current }),
    });
    if (res.ok) {
      const updated = await res.json();
      setModules(modules.map((m) => (m._id === id ? updated : m)));
    }
  };

  const getBadgeColor = (level: string) => ({
    Easy: 'bg-purple-100 text-purple-700 font-bold',
    Medium: 'bg-yellow-100 text-yellow-700 font-bold',
    Hard: 'bg-red-100 text-red-700 font-bold',
  }[level] || 'bg-gray-100 text-gray-700');

  return (
    <div className="flex relative min-h-screen">
      <Sidebar />

      {/* Background Image */}
      <div className="absolute inset-0">
        <img src="/images/aaa.jpg" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      </div>

      {/* Content */}
      <main className="relative flex-1 ml-64 p-6 z-10 space-y-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-blue-500" />
          <h1 className="text-4xl font-extrabold text-gray-900">Study Schedule</h1>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white/90 shadow">
            <CardContent className="flex items-center gap-4 p-5">
              <BookOpen className="text-blue-500 h-8 w-8" />
              <div><p className="text-2xl font-bold">{subjects.length}</p><p>Subjects</p></div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 shadow">
            <CardContent className="flex items-center gap-4 p-5">
              <Target className="text-purple-500 h-8 w-8" />
              <div><p className="text-2xl font-bold">{modules.length}</p><p>Modules</p></div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 shadow">
            <CardContent className="flex items-center gap-4 p-5">
              <Clock className="text-green-500 h-8 w-8" />
              <div><p className="text-2xl font-bold">{modules.reduce((a, m) => a + m.estimatedHours, 0)}h</p><p>Total Time</p></div>
            </CardContent>
          </Card>
        </section>

        {/* Add Subject & Module */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/90">
            <CardHeader><CardTitle><Plus className="h-5 w-5" /> Add Subject</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Subject Name</Label>
              <Input value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} />
              <Label>Color</Label>
              <Input type="color" value={newSubject.color} onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })} />
              <Button onClick={addSubject} className="bg-blue-600 text-white w-full">Add</Button>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardHeader><CardTitle><Plus className="h-5 w-5" /> Add Module</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Subject</Label>
              <Select value={newModule.subjectId} onValueChange={(v) => setNewModule({ ...newModule, subjectId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose subject" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Label>Module Name</Label>
              <Input value={newModule.name} onChange={(e) => setNewModule({ ...newModule, name: e.target.value })} />
              <Label>Difficulty</Label>
              <Select value={newModule.difficulty} onValueChange={(v) => setNewModule({ ...newModule, difficulty: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
              </Select>
              <Label>Hours</Label>
              <Input type="number" value={newModule.estimatedHours} onChange={(e) => setNewModule({ ...newModule, estimatedHours: parseInt(e.target.value) })} />
              <Button onClick={addModule} className="bg-purple-600 text-white w-full">Add</Button>
            </CardContent>
          </Card>
        </section>

        {/* Subjects List */}
        <section className="space-y-6">
          {subjects.length === 0 ? (
            <Card className="bg-white/80 p-10 text-center">No subjects yet.</Card>
          ) : subjects.map((s) => {
            const sModules = modules.filter((m) => m.subjectId === s._id);
            const completed = sModules.filter((m) => m.completed).length;
            const progress = sModules.length ? Math.round((completed / sModules.length) * 100) : 0;

            return (
              <Card key={s._id} className="bg-white/90">
                <CardHeader className="flex justify-between">
                  <CardTitle className="flex gap-2"><span style={{ background: s.color }} className="h-4 w-4 rounded-full" />{s.name}</CardTitle>
                  <span>{progress}% complete</span>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sModules.map((m) => (
                    <div key={m._id} onClick={() => toggleCompletion(m._id, m.completed)}
                      className={`p-4 rounded border cursor-pointer ${m.completed ? "bg-green-100 border-green-300" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex justify-between">
                        <h4 className={m.completed ? "line-through text-gray-500" : ""}>{m.name}</h4>
                        <Badge className={getBadgeColor(m.difficulty)}>{m.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1"><Clock className="w-4 h-4" /> {m.estimatedHours} hrs</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}
