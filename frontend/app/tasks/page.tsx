'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, CheckCircle } from 'lucide-react';

type Task = {
  _id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  reminderSent?: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<
    'all' | 'High' | 'Medium' | 'Low'
  >('all');
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
  });
  const [showForm, setShowForm] = useState(false);

  // Fetch tasks initially
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    };
    fetchTasks();
  }, []);

  // 🔔 Auto-check for reminders every 1 minute
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/tasks/reminders');
        if (res.ok) {
          const data = await res.json();
          if (data.count > 0) {
            alert(`📧 ${data.count} reminder(s) were just sent to your email.`);
          }
        }
      } catch (err) {
        console.error('Reminder check failed', err);
      }
    }, 60 * 1000); // every 1 min

    return () => clearInterval(interval);
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.dueDate) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });

    if (res.ok) {
      const created = await res.json();
      setTasks([...tasks, created]);
      setNewTask({ title: '', subject: '', dueDate: '', priority: 'Medium' });
      setShowForm(false);
    }
  };

  const toggleCompletion = async (id: string, completed: boolean) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t._id === id ? updated : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTasks(tasks.filter((t) => t._id !== id));
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'Medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'Low':
        return 'border-green-500 bg-green-50 text-green-800';
      default:
        return 'border-slate-300 bg-slate-50 text-slate-800';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/aaa.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-lg" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Tasks</h1>
            <p className="text-slate-600">
              Organize and manage your study tasks effectively
            </p>
          </div>
        </div>

        {/* Filters & Add button */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Select value={filter} onValueChange={(val) => setFilter(val as any)}>
            <SelectTrigger className="w-32 bg-white border">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(val) => setPriorityFilter(val as any)}
          >
            <SelectTrigger className="w-32 bg-white border">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Task'}
          </Button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <Card className="bg-white/80 backdrop-blur-md border p-4 mb-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Title"
              />
              <Input
                value={newTask.subject}
                onChange={(e) =>
                  setNewTask({ ...newTask, subject: e.target.value })
                }
                placeholder="Subject"
              />
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
              <Select
                value={newTask.priority}
                onValueChange={(val) =>
                  setNewTask({ ...newTask, priority: val as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="mt-4 bg-slate-700 text-white"
              onClick={handleAddTask}
            >
              Save Task
            </Button>
          </Card>
        )}

        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <Card
              key={task._id}
              className={`p-4 shadow-md border-l-4 bg-white/90 backdrop-blur-md ${getPriorityStyles(
                task.priority
              )}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={`font-semibold text-lg ${
                      task.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-600">{task.subject}</p>
                  {task.dueDate && (
                    <p className="text-sm text-slate-600">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <span
                    className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded ${getPriorityStyles(
                      task.priority
                    )}`}
                  >
                    {task.priority} Priority
                  </span>
                </div>
                <div className="flex gap-2">
                  {!task.completed ? (
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => toggleCompletion(task._id, task.completed)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={() => toggleCompletion(task._id, task.completed)}
                    >
                      Undo
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => deleteTask(task._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-slate-800">No tasks found</h3>
            <p className="text-slate-600 mb-6">
              Start adding your study tasks to stay organized
            </p>
            <Button
              className="bg-slate-700 text-white"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Your First Task
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
