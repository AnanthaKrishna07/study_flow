'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, CheckCircle, Calendar } from 'lucide-react';

type Topic = {
  _id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  completed: boolean;
};

type Module = {
  _id: string;
  name: string;
  subjectId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  completed: boolean;
  topics: Topic[];
};

type SubjectWithModules = {
  _id: string;
  name: string;
  color: string;
  totalModules?: number;
  completedModules?: number;
  modules: Module[];
};

export default function SubjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [subject, setSubject] = useState<SubjectWithModules | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch subject with modules
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/schedule/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSubject(data);
        }
      } catch (err) {
        console.error('Error fetching subject details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // 🔹 Toggle module completion
  const toggleCompletion = async (moduleId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/schedule/modules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: moduleId, completed: !completed }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSubject((prev) =>
          prev
            ? {
                ...prev,
                modules: prev.modules.map((m) =>
                  m._id === moduleId ? updated : m
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Error updating module:', err);
    }
  };

  const getBadgeColor = (difficulty: string) =>
    ({
      Easy: 'bg-purple-100 text-purple-700 font-bold',
      Medium: 'bg-yellow-100 text-yellow-700 font-bold',
      Hard: 'bg-red-100 text-red-700 font-bold',
    }[difficulty] || 'bg-gray-100 text-gray-700');

  const getPriorityColor = (priority: string) =>
    ({
      High: 'bg-red-100 text-red-700 font-semibold',
      Medium: 'bg-yellow-100 text-yellow-700 font-semibold',
      Low: 'bg-green-100 text-green-700 font-semibold',
    }[priority] || 'bg-gray-100 text-gray-700');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading subject details...
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Subject not found
      </div>
    );
  }

  return (
    <div className="flex relative min-h-screen">
      <Sidebar />

      {/* Background */}
      <div className="absolute inset-0">
        <img src="/images/aaa.jpg" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      </div>

      {/* Main Content */}
      <main className="relative flex-1 ml-64 p-6 z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-blue-500" />
          <h1 className="text-4xl font-extrabold text-gray-900">{subject.name}</h1>
        </div>

        {/* Modules Section */}
        <section className="space-y-6">
          {subject.modules.length === 0 ? (
            <Card className="bg-white/90 p-10 text-center">
              <p>No modules added yet.</p>
            </Card>
          ) : (
            subject.modules.map((m) => (
              <Card key={m._id} className="bg-white/90 hover:shadow-lg transition">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    <Badge className={getBadgeColor(m.difficulty)}>{m.difficulty}</Badge>
                  </CardTitle>
                  <Button
                    size="sm"
                    className={`${
                      m.completed
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={() => toggleCompletion(m._id, m.completed)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {m.completed ? 'Completed' : 'Mark Complete'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {m.estimatedHours} hrs
                  </p>

                  {/* Topics */}
                  {m.topics && m.topics.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800">Topics</h4>
                      {m.topics.map((t) => (
                        <div
                          key={t._id}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded border"
                        >
                          <div>
                            <p
                              className={`text-sm ${
                                t.completed ? 'line-through text-gray-400' : 'text-gray-700'
                              }`}
                            >
                              {t.title}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
