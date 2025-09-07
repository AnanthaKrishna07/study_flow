'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { BookOpen, Plus, Clock, CheckCircle, Calendar } from 'lucide-react';
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

type Topic = {
  _id?: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  completed: boolean;
};

type Module = {
  _id: string;
  subjectId: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  completed: boolean;
  topics: Topic[];
};

export default function SchedulePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3B82F6' });
  const [newModule, setNewModule] = useState({ name: '', subjectId: '', difficulty: 'Medium', estimatedHours: '2' }); // ✅ string
  const [newTopic, setNewTopic] = useState<{ [key: string]: { title: string; priority: 'Low' | 'Medium' | 'High'; dueDate: string } }>({});

  // Fetch subjects + modules
  useEffect(() => {
    const fetchData = async () => {
      const [s, m] = await Promise.all([fetch('/api/schedule/subjects'), fetch('/api/schedule/modules')]);
      if (s.ok) setSubjects(await s.json());
      if (m.ok) setModules(await m.json());
    };
    fetchData();
  }, []);

  const addSubject = async () => {
    if (!newSubject.name) return;
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
      body: JSON.stringify({
        ...newModule,
        estimatedHours: Number(newModule.estimatedHours) || 0, // ✅ convert safely
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setModules([...modules, created]);
      setNewModule({ name: '', subjectId: '', difficulty: 'Medium', estimatedHours: '2' });
    }
  };

  const toggleModuleCompletion = async (id: string, current: boolean) => {
    const res = await fetch('/api/schedule/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id, completed: !current }),
    });
    if (res.ok) {
      const updated = await res.json();
      setModules(modules.map((m) => (m._id === id ? updated : m)));
    }
  };

  const toggleTopicCompletion = async (moduleId: string, topicId: string, completed: boolean) => {
    const res = await fetch('/api/schedule/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: moduleId,
        topicId,
        topicUpdate: { completed: !completed },
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setModules(modules.map((m) => (m._id === moduleId ? updated : m)));
    }
  };

  const addTopic = async (moduleId: string) => {
    const topicData = newTopic[moduleId];
    if (!topicData?.title) return;

    const res = await fetch('/api/schedule/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: moduleId,
        newTopic: { ...topicData, completed: false },
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setModules(modules.map((m) => (m._id === moduleId ? updated : m)));
      setNewTopic({ ...newTopic, [moduleId]: { title: '', priority: 'Medium', dueDate: '' } });
    }
  };

  const getBadgeColor = (level: string) => ({
    Easy: 'bg-purple-100 text-purple-700 font-bold',
    Medium: 'bg-yellow-100 text-yellow-700 font-bold',
    Hard: 'bg-red-100 text-red-700 font-bold',
  }[level] || 'bg-gray-100 text-gray-700');

  const getPriorityColor = (priority: string) => ({
    High: 'bg-red-100 text-red-700 font-semibold',
    Medium: 'bg-yellow-100 text-yellow-700 font-semibold',
    Low: 'bg-green-100 text-green-700 font-semibold',
  }[priority] || 'bg-gray-100 text-gray-700');

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
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Label>Hours</Label>
              <Input
                type="number"
                min={1}
                value={newModule.estimatedHours}
                onChange={(e) => setNewModule({ ...newModule, estimatedHours: e.target.value })}
              />
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
              <Card key={s._id} className="bg-white/90 p-4">
                <CardHeader className="flex justify-between">
                  <CardTitle className="flex gap-2 items-center">
                    <span style={{ background: s.color }} className="h-4 w-4 rounded-full" />{s.name}
                  </CardTitle>
                  <span>{progress}% complete</span>
                </CardHeader>
                <CardContent className="space-y-6">
                  {sModules.map((m) => (
                    <div key={m._id} className="p-4 rounded border bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{m.name}</h4>
                        <Badge className={getBadgeColor(m.difficulty)}>{m.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1"><Clock className="w-4 h-4" /> {m.estimatedHours} hrs</p>

                      {/* Topics */}
                      <div className="mt-4 space-y-2">
                        <h5 className="font-medium text-sm text-gray-700">Topics</h5>
                        {m.topics.length === 0 ? (
                          <p className="text-xs text-gray-500">No topics yet.</p>
                        ) : m.topics.map((t, idx) => (
                          <div key={t._id || `${m._id}-topic-${idx}`} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                            <div>
                              <p className={`text-sm ${t.completed ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {t.dueDate ? new Date(t.dueDate).toLocaleString() : 'No due date'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                              <Button size="sm" onClick={() => toggleTopicCompletion(m._id, t._id || '', t.completed)} className="bg-green-600 text-white hover:bg-green-700">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Topic */}
                      <div className="mt-3 space-y-2">
                        <Input
                          placeholder="Topic title"
                          value={newTopic[m._id]?.title || ''}
                          onChange={(e) => setNewTopic({ ...newTopic, [m._id]: { ...(newTopic[m._id] || { priority: 'Medium', dueDate: '' }), title: e.target.value } })}
                        />
                        <div className="flex gap-2">
                          <Select
                            value={newTopic[m._id]?.priority || 'Medium'}
                            onValueChange={(v) => setNewTopic({ ...newTopic, [m._id]: { ...(newTopic[m._id] || { title: '', dueDate: '' }), priority: v as any } })}
                          >
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="datetime-local"
                            value={newTopic[m._id]?.dueDate || ''}
                            onChange={(e) => setNewTopic({ ...newTopic, [m._id]: { ...(newTopic[m._id] || { title: '', priority: 'Medium' }), dueDate: e.target.value } })}
                          />
                        </div>
                        <Button onClick={() => addTopic(m._id)} className="bg-blue-600 text-white w-full">Add Topic</Button>
                      </div>

                      {/* Complete Module */}
                      <div className="mt-3">
                        <Button onClick={() => toggleModuleCompletion(m._id, m.completed)} className={`${m.completed ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'} text-white w-full`}>
                          {m.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      </div>
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
