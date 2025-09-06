'use client';

import Sidebar from '@/components/ui/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatCard from '@/components/ui/StatCard';
import QuickAdd from '@/components/ui/QuickAdd';
import {
  BookOpen,
  Clock,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react';

type DashboardStats = {
  totalTasks: number;
  completedTasks: number;
  upcomingEvents: number;
  completedModules: number;
  totalModules: number;
  todayTasks: number;
};

type TaskItem = {
  _id?: string;
  id?: string;
  title: string;
  dueDate?: string | Date;
  completed?: boolean;
  priority?: 'Low' | 'Medium' | 'High';
  subject?: string;
};

type EventItem = {
  _id?: string;
  id?: string;
  title: string;
  date: string | Date;
  time?: string;
  type?: 'Exam' | 'Meeting' | 'Placement' | 'Deadline' | 'Other';
};

export default function Dashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    completedModules: 0,
    totalModules: 0,
    todayTasks: 0,
  });

  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard', { cache: 'no-store' });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await res.json();

        setStats({
          totalTasks: data?.stats?.totalTasks ?? 0,
          completedTasks: data?.stats?.completedTasks ?? 0,
          upcomingEvents: data?.stats?.upcomingEvents ?? 0,
          completedModules: data?.stats?.completedModules ?? 0,
          totalModules: data?.stats?.totalModules ?? 0,
          todayTasks: data?.stats?.todayTasks ?? 0,
        });

        setUpcomingTasks(Array.isArray(data?.upcomingTasks) ? data.upcomingTasks : []);
        setUpcomingEventsList(
          Array.isArray(data?.upcomingEventsList) ? data.upcomingEventsList : []
        );
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const moduleProgress =
    stats.totalModules > 0
      ? Math.round((stats.completedModules / stats.totalModules) * 100)
      : 0;

  const getTaskPriorityBadge = (priority?: string) => {
    const p = priority || 'Medium';
    return p === 'High'
      ? 'bg-red-100 text-red-800'
      : p === 'Medium'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-green-100 text-green-800';
  };

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <Sidebar />

      {/* ✅ Background Image with Blur Effect */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/aaa.jpg" 
          alt="Dashboard Background"
          className="w-full h-full object-cover opacity-30"
        />
        {/* Glassy overlay for blur */}
        <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 min-h-screen relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-700 text-lg mb-8">
            Welcome back! Here's your study overview.
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="py-8 text-center text-slate-600">
              Loading your dashboard...
            </CardContent>
          </Card>
        )}
        {error && !loading && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4 text-center text-red-700">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Tasks"
                value={stats.totalTasks}
                icon={CheckSquare}
                color="blue"
                change={`${stats.completedTasks} completed`}
              />
              <StatCard
                title="Today's Tasks"
                value={stats.todayTasks}
                icon={Clock}
                color="orange"
              />
              <StatCard
                title="Upcoming Events"
                value={stats.upcomingEvents}
                icon={Calendar}
                color="purple"
              />
              <StatCard
                title="Study Progress"
                value={`${moduleProgress}%`}
                icon={TrendingUp}
                color="green"
                change={`${stats.completedModules}/${stats.totalModules} modules`}
              />
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Tasks Completion */}
              <Card className="hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Task Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="font-semibold">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{stats.completedTasks} completed</span>
                      <span>{stats.totalTasks - stats.completedTasks} remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Modules */}
              <Card className="hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Study Modules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Module Progress</span>
                      <span className="font-semibold">{moduleProgress}%</span>
                    </div>
                    <Progress value={moduleProgress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{stats.completedModules} completed</span>
                      <span>
                        {Math.max(stats.totalModules - stats.completedModules, 0)} remaining
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Tasks */}
              <Card className="hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => {
                        const key = task._id || task.id || Math.random().toString();
                        const due = task.dueDate ? new Date(task.dueDate) : null;
                        const priority = task.priority || 'Medium';
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transform hover:scale-105 hover:bg-blue-100 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{task.title}</p>
                              <p className="text-sm text-gray-500">
                                {due ? `Due: ${due.toLocaleDateString()}` : 'No due date'}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getTaskPriorityBadge(
                                priority
                              )}`}
                            >
                              {priority}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Events */}
              <Card className="hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEventsList.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No upcoming events</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEventsList.map((event) => {
                        const key = event._id || event.id || Math.random().toString();
                        const date = event.date ? new Date(event.date) : null;
                        const type = event.type || 'Other';
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transform hover:scale-105 hover:bg-purple-100 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{event.title}</p>
                              <p className="text-sm text-gray-500">
                                {date ? date.toLocaleDateString() : 'No date'}
                                {event.time ? ` at ${event.time}` : ''}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                type === 'Exam'
                                  ? 'bg-red-100 text-red-800'
                                  : type === 'Meeting'
                                  ? 'bg-blue-100 text-blue-800'
                                  : type === 'Placement'
                                  ? 'bg-green-100 text-green-800'
                                  : type === 'Deadline'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Add */}
            <div className="mt-8">
              <QuickAdd />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
