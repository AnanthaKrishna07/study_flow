'use client';

import Sidebar from '@/components/ui/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Target,
  AlertTriangle,
  LineChart as LineChartIcon,
  CalendarClock,
  Timer,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

export default function Analytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">Loading Analytics...</div>;
  }

  return (
    <div className="flex relative min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Background */}
      <div className="absolute inset-0">
        <img src="/images/aaa.jpg" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      </div>

      {/* Main */}
      <main className="relative flex-1 ml-64 p-6 z-10 space-y-8">
        {/* Heading */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Study Analytics</h1>
          <p className="text-slate-700 text-lg">Track study progress, habits, and time management.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <StatCard
            title="Completion Rate"
            value={`${data.taskStats.completionRate}%`}
            icon={TrendingUp}
            color="blue"
            change={`${data.taskStats.completed}/${data.taskStats.total} tasks`}
          />
          <StatCard
            title="Module Progress"
            value={`${data.moduleStats.completionRate}%`}
            icon={Target}
            color="green"
            change={`${data.moduleStats.completed}/${data.moduleStats.total} modules`}
          />
          <StatCard
            title="Overdue Tasks"
            value={data.taskStats.overdue}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* 4 Small Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <AnalyticsPie title="Task Status Distribution" data={data.taskStatus} />
          <AnalyticsPie title="Module Difficulty Levels" data={data.difficultyDist} />
          <AnalyticsLine
            title="Task Completion Trend"
            data={data.weeklyTrend}
            xKey="week"
            yKey="completedTasks"
            color="#10B981"
          />
          <AnalyticsBar
            title="Module Progress by Subject"
            data={data.subjectAllocation.map((s: any) => ({
              name: s.name,
              completed: s.completedModules,
              total: s.totalModules,
            }))}
          />
        </div>

        {/* Study Hours */}
        <Card className="bg-white/80 backdrop-blur-sm mt-8 hover:shadow-md">
          <CardHeader className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-slate-600" />
            <CardTitle>Planned vs Actual Study Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.studyHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#3B82F6" name="Planned Hours" />
                <Bar dataKey="actual" fill="#10B981" name="Actual Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card className="bg-white/80 backdrop-blur-sm mt-8 hover:shadow-md">
          <CardHeader className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-slate-600" />
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.deadlinePressure}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#F59E0B" name="Tasks Due" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productivity */}
        <Card className="bg-white/80 backdrop-blur-sm mt-8 hover:shadow-md">
          <CardHeader>
            <CardTitle>Productivity by Time of Day (from Schedule)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.studyScheduleProductivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#6366F1" name="Study Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/* ✅ Pie Chart */
function AnalyticsPie({ title, data }: { title: string; data: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={70} label dataKey="value">
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ✅ Line Chart */
function AnalyticsLine({
  title,
  data,
  xKey,
  yKey,
  color,
}: {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  color: string;
}) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ✅ Bar Chart */
function AnalyticsBar({ title, data }: { title: string; data: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="#10B981" name="Completed Modules" />
            <Bar dataKey="total" fill="#3B82F6" name="Total Modules" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
