'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// =================== Types ===================
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
  subjectId: string | { _id: string; name: string; color: string };
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  completed: boolean;
  topics: Topic[];
};

// =================== Component ===================
export default function SchedulePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3B82F6' });
  const [newModule, setNewModule] = useState({
    name: '',
    subjectId: '',
    difficulty: 'Medium',
    estimatedHours: '2',
  });
  const [newTopic, setNewTopic] = useState<
    Record<
      string,
      { title: string; priority: 'Low' | 'Medium' | 'High'; dueDate: string }
    >
  >({});

  // =================== Fetch Data ===================
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, mRes] = await Promise.all([
        fetch('/api/schedule/subjects', { cache: 'no-store' }),
        fetch('/api/schedule/modules', { cache: 'no-store' }),
      ]);
      if (sRes.ok) setSubjects(await sRes.json());
      if (mRes.ok) setModules(await mRes.json());
    } catch (err) {
      console.error('Fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  // =================== Subject Operations ===================
  const addSubject = async () => {
    const trimmedName = newSubject.name.trim();
    if (!trimmedName) return alert('⚠️ Enter subject name.');

    if (subjects.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase()))
      return alert('⚠️ Subject with same name exists.');
    if (subjects.some((s) => s.color.toLowerCase() === newSubject.color.toLowerCase()))
      return alert('⚠️ This color is already used. Choose another.');

    setAddingSubject(true);
    try {
      const res = await fetch('/api/schedule/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSubject, name: trimmedName }),
      });
      if (res.ok) {
        const created = await res.json();
        setSubjects((p) => [...p, created]);
        setNewSubject({ name: '', color: '#3B82F6' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSubject(false);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Delete this subject and all its modules?')) return;
    try {
      const res = await fetch('/api/schedule/subjects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });
      if (res.ok) {
        setSubjects((p) => p.filter((s) => s._id !== id));
        setModules((p) => p.filter((m) => m.subjectId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =================== Module Operations ===================
  const addModule = async () => {
    if (!newModule.name || !newModule.subjectId)
      return alert('Fill module details.');

    const duplicate = modules.some(
      (m) =>
        m.name.toLowerCase() === newModule.name.trim().toLowerCase() &&
        ((typeof m.subjectId === 'string' ? m.subjectId : m.subjectId?._id) ===
          newModule.subjectId)
    );
    if (duplicate) return alert('⚠️ Module already exists for this subject.');

    const payload = {
      name: newModule.name.trim(),
      subjectId: newModule.subjectId,
      difficulty: newModule.difficulty,
      estimatedHours: Number(newModule.estimatedHours) || 1,
    };
    try {
      const res = await fetch('/api/schedule/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setModules((p) => [...p, created]);
        setNewModule({
          name: '',
          subjectId: '',
          difficulty: 'Medium',
          estimatedHours: '2',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Delete this module?')) return;
    try {
      const res = await fetch('/api/schedule/modules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });
      if (res.ok) setModules((p) => p.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
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
      setModules((p) => p.map((m) => (m._id === id ? updated : m)));
    }
  };

  // =================== Topic Operations ===================
  const addTopic = async (moduleId: string) => {
    const data = newTopic[moduleId];
    if (!data?.title) return;
    const payload = { _id: moduleId, newTopic: { ...data, completed: false } };
    const res = await fetch('/api/schedule/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setModules((p) => p.map((m) => (m._id === moduleId ? updated : m)));
      setNewTopic((p) => ({
        ...p,
        [moduleId]: { title: '', priority: 'Medium', dueDate: '' },
      }));
    }
  };

  const deleteTopic = async (moduleId: string, topicId: string) => {
    if (!confirm('Delete this topic?')) return;
    const payload = { _id: moduleId, deleteTopic: topicId };
    const res = await fetch('/api/schedule/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setModules((p) => p.map((m) => (m._id === moduleId ? updated : m)));
    }
  };

  const toggleTopicCompletion = async (
    moduleId: string,
    topicId: string,
    completed: boolean
  ) => {
    const payload = { _id: moduleId, topicId, topicUpdate: { completed: !completed } };
    const res = await fetch('/api/schedule/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setModules((p) => p.map((m) => (m._id === moduleId ? updated : m)));
    }
  };

  // =================== Helpers ===================
  const getBadgeColor = (level: string) =>
    level === 'Easy'
      ? 'bg-purple-100 text-purple-700'
      : level === 'Medium'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  const getPriorityColor = (priority: string) =>
    priority === 'High'
      ? 'bg-red-100 text-red-700'
      : priority === 'Medium'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-green-100 text-green-700';

  // =================== JSX ===================
  return (
    <div className="flex relative min-h-screen">
      <Sidebar />

      {/* Background */}
      <div className="absolute inset-0">
        <img src="/images/aaa.jpg" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      </div>

      <main className="relative flex-1 ml-64 p-6 z-10 space-y-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-blue-500" />
          <h1 className="text-4xl font-extrabold text-gray-900">Study Schedule</h1>
        </div>

        {/* =================== SUBJECT OVERVIEW =================== */}
        <section className="bg-white/90 rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" /> Subject Overview
          </h2>

          {subjects.length === 0 ? (
            <p className="text-gray-500 text-sm">No subjects created yet.</p>
          ) : (
            <div className="space-y-6">
              {subjects.map((s) => {
                const sModules = modules.filter((m) =>
                  typeof m.subjectId === 'string'
                    ? m.subjectId === s._id
                    : m.subjectId?._id === s._id
                );

                return (
                  <div
                    key={s._id}
                    className="border rounded-lg p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <span
                          style={{ background: s.color }}
                          className="h-4 w-4 rounded-full inline-block"
                        />
                        {s.name}
                      </h3>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSubject(s._id)}
                        className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </div>

                    {sModules.length === 0 ? (
                      <p className="text-sm text-gray-500 pl-2">No modules yet.</p>
                    ) : (
                      <ul className="pl-4 space-y-3">
                        {sModules.map((m) => (
                          <li
                            key={m._id}
                            className="border-b border-gray-200 pb-2 last:border-0"
                          >
                            <div className="flex justify-between items-center">
                              <strong className="text-gray-800">{m.name}</strong>
                              <span className="text-xs text-gray-500">
                                {m.topics.filter((t) => t.completed).length}/
                                {m.topics.length} topics done
                              </span>
                            </div>

                            {m.topics.length > 0 ? (
                              <ul className="pl-4 mt-1 space-y-1">
                                {m.topics.map((t) => (
                                  <li
                                    key={t._id ?? `${m._id}-topic-${t.title}`}
                                    className={`text-sm flex items-center gap-2 ${
                                      t.completed ? 'text-green-700' : 'text-gray-600'
                                    }`}
                                  >
                                    {t.completed ? '✅' : '⏳'} {t.title}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-gray-400 pl-4">
                                No topics yet.
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =================== ADD SUBJECT / MODULE =================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Subject */}
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle>
                <Plus className="h-5 w-5" /> Add Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Subject Name</Label>
              <Input
                value={newSubject.name}
                onChange={(e) => setNewSubject((p) => ({ ...p, name: e.target.value }))}
              />
              <Label>Color</Label>
              <Input
                type="color"
                value={newSubject.color}
                onChange={(e) => setNewSubject((p) => ({ ...p, color: e.target.value }))}
              />
              <Button
                onClick={addSubject}
                disabled={addingSubject}
                className="bg-blue-600 text-white w-full disabled:opacity-50"
              >
                {addingSubject ? 'Adding...' : 'Add Subject'}
              </Button>
            </CardContent>
          </Card>

          {/* Add Module */}
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle>
                <Plus className="h-5 w-5" /> Add Module
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Subject</Label>
              <Select
                value={newModule.subjectId}
                onValueChange={(v) => setNewModule((p) => ({ ...p, subjectId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Module Name</Label>
              <Input
                value={newModule.name}
                onChange={(e) => setNewModule((p) => ({ ...p, name: e.target.value }))}
              />

              <Label>Difficulty</Label>
              <Select
                value={newModule.difficulty}
                onValueChange={(v) => setNewModule((p) => ({ ...p, difficulty: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Label>Estimated Hours</Label>
              <Input
                type="number"
                min={1}
                value={newModule.estimatedHours}
                onChange={(e) =>
                  setNewModule((p) => ({ ...p, estimatedHours: e.target.value }))
                }
              />
              <Button onClick={addModule} className="bg-purple-600 text-white w-full">
                Add Module
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* =================== MODULES & TOPICS =================== */}
        <section className="space-y-6">
          {loading ? (
            <p>Loading...</p>
          ) : subjects.length === 0 ? (
            <Card className="bg-white/80 p-10 text-center">No subjects yet.</Card>
          ) : (
            subjects.map((s) => {
              const sModules = modules.filter((m) =>
                typeof m.subjectId === 'string'
                  ? m.subjectId === s._id
                  : m.subjectId?._id === s._id
              );
              return (
                <Card key={s._id} className="bg-white/90 p-4">
                  <CardHeader className="flex justify-between">
                    <CardTitle className="flex gap-2 items-center">
                      <span
                        style={{ background: s.color }}
                        className="h-4 w-4 rounded-full inline-block"
                      />{' '}
                      {s.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {sModules.length === 0 ? (
                      <p className="text-gray-500 text-sm">No modules yet.</p>
                    ) : (
                      sModules.map((m) => (
                        <div key={m._id} className="p-4 rounded border bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{m.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getBadgeColor(m.difficulty)}>
                                {m.difficulty}
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => deleteModule(m._id)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {m.estimatedHours} hrs
                          </p>

                          {/* Topics List */}
                          <div className="mt-4 space-y-2">
                            <h5 className="font-medium text-sm text-gray-700">
                              Topics
                            </h5>
                            {m.topics.length === 0 ? (
                              <p className="text-xs text-gray-500">No topics yet.</p>
                            ) : (
                              m.topics.map((t, idx) => (
                                <div
                                  key={t._id ?? `${m._id}-topic-${idx}`}
                                  className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                                >
                                  <div>
                                    <p
                                      className={`text-sm ${
                                        t.completed
                                          ? 'line-through text-gray-400'
                                          : ''
                                      }`}
                                    >
                                      {t.title}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />{' '}
                                      {t.dueDate
                                        ? new Date(t.dueDate).toLocaleString()
                                        : 'No due date'}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                                        t.priority
                                      )}`}
                                    >
                                      {t.priority}
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        toggleTopicCompletion(
                                          m._id,
                                          t._id ?? '',
                                          t.completed
                                        )
                                      }
                                      className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => deleteTopic(m._id, t._id ?? '')}
                                      className="bg-red-600 text-white hover:bg-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add Topic */}
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Topic title"
                              value={newTopic[m._id]?.title || ''}
                              onChange={(e) =>
                                setNewTopic((p) => ({
                                  ...p,
                                  [m._id]: {
                                    ...(p[m._id] || {
                                      priority: 'Medium',
                                      dueDate: '',
                                    }),
                                    title: e.target.value,
                                  },
                                }))
                              }
                            />
                            <div className="flex gap-2">
                              <Select
                                value={newTopic[m._id]?.priority || 'Medium'}
                                onValueChange={(v) =>
                                  setNewTopic((p) => ({
                                    ...p,
                                    [m._id]: {
                                      ...(p[m._id] || { title: '', dueDate: '' }),
                                      priority: v as any,
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                type="datetime-local"
                                value={newTopic[m._id]?.dueDate || ''}
                                onChange={(e) =>
                                  setNewTopic((p) => ({
                                    ...p,
                                    [m._id]: {
                                      ...(p[m._id] || {
                                        title: '',
                                        priority: 'Medium',
                                      }),
                                      dueDate: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <Button
                              onClick={() => addTopic(m._id)}
                              className="bg-blue-600 text-white w-full"
                            >
                              Add Topic
                            </Button>
                          </div>

                          {/* Mark Complete */}
                          <div className="mt-3">
                            <Button
                              onClick={() =>
                                toggleModuleCompletion(m._id, m.completed)
                              }
                              className={`${
                                m.completed
                                  ? 'bg-yellow-500 hover:bg-yellow-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              } text-white w-full`}
                            >
                              {m.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
