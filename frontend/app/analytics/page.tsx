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
} from 'recharts';
import {
  TrendingUp,
  Target,
  AlertTriangle,
  BookOpen,
  Clock,
  LineChart as LineChartIcon,
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

      {/* ✅ Background */}
      <div className="absolute inset-0">
        <img src="/images/aaa.jpg" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      </div>

      {/* Main */}
      <main className="relative flex-1 ml-64 p-6 z-10 space-y-8">
        {/* Heading */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Study Analytics</h1>
          <p className="text-slate-700 text-lg">Visualize your study progress & performance.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
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
            title="Active Subjects"
            value={data.subjectAllocation.length}
            icon={BookOpen}
            color="purple"
          />
          <StatCard
            title="Overdue Tasks"
            value={data.taskStats.overdue}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* 📊 Small Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <AnalyticsPie title="Task Status" data={data.taskStatus} />
          <AnalyticsPie title="Task Priority" data={data.priorityDist} />
          <AnalyticsPie title="Task Types" data={data.taskTypeDist} />
          <AnalyticsPie title="Module Difficulty" data={data.difficultyDist} />
        </div>

        {/* ⏰ Study Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AnalyticsPie title="Weekly Study Time" data={data.studyTimeDist} icon={Clock} />
        </div>

        {/* 📚 Subject Progress */}
        {data.subjectAllocation.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {data.subjectAllocation.map((s: any, idx: number) => (
              <Card
                key={idx}
                className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
              >
                <CardHeader>
                  <CardTitle>{s.name} Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: s.completedModules, color: '#10B981' },
                          { name: 'Pending', value: s.totalModules - s.completedModules, color: '#EF4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 📈 Trend Chart */}
        <Card className="bg-white/80 backdrop-blur-sm mt-8 hover:shadow-md">
          <CardHeader className="flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-slate-600" />
            <CardTitle>Weekly Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completedTasks"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="completedModules"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Modules"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/* ✅ Reusable Pie Chart */
function AnalyticsPie({
  title,
  data,
  icon: Icon,
}: {
  title: string;
  data: any[];
  icon?: any;
}) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
      <CardHeader className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-slate-600" />}
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
