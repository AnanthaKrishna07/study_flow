'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, AlertTriangle, BookOpen } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

export default function Analytics() {
  const { tasks = [], events = [], modules = [], subjects = [] } = useApp();

  // --- Task Stats ---
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length,
  };

  const completionRate =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  // --- Module Stats ---
  const moduleStats = {
    total: modules.length,
    completed: modules.filter(m => m.completed).length,
    easy: modules.filter(m => m.difficulty === 'Easy').length,
    medium: modules.filter(m => m.difficulty === 'Medium').length,
    hard: modules.filter(m => m.difficulty === 'Hard').length,
  };

  const moduleProgress =
    moduleStats.total > 0
      ? Math.round((moduleStats.completed / moduleStats.total) * 100)
      : 0;

  // --- Priority Data ---
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'High').length, color: '#EF4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: '#F59E0B' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: '#10B981' },
  ].filter(item => item.value > 0);

  // --- Task Type Data ---
  const taskTypeData = [
    { name: 'Homework', value: tasks.filter(t => t.type === 'Homework').length },
    { name: 'Assignment', value: tasks.filter(t => t.type === 'Assignment').length },
    { name: 'Project', value: tasks.filter(t => t.type === 'Project').length },
    { name: 'Reading', value: tasks.filter(t => t.type === 'Reading').length },
    { name: 'Other', value: tasks.filter(t => t.type === 'Other').length },
  ].filter(item => item.value > 0);

  // --- Difficulty Data ---
  const difficultyData = [
    { name: 'Easy', value: moduleStats.easy, color: '#10B981' },
    { name: 'Medium', value: moduleStats.medium, color: '#F59E0B' },
    { name: 'Hard', value: moduleStats.hard, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // --- Subject Progress ---
  const subjectProgress = subjects.map(subject => {
    const subjectModules = modules.filter(m => m.subjectId === subject.id);
    const completedModules = subjectModules.filter(m => m.completed).length;
    const progress =
      subjectModules.length > 0
        ? Math.round((completedModules / subjectModules.length) * 100)
        : 0;
    return {
      name: subject.name,
      progress,
      total: subjectModules.length,
      completed: completedModules,
    };
  });

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url('/images/aaa.jpg')",
      }}
    >
      {/* Page Heading */}
      <div>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
          Study Analytics
        </h1>
        <p className="text-slate-600 text-lg">
          Visualize your study progress and performance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={TrendingUp}
          color="blue"
          change={`${taskStats.completed}/${taskStats.total} tasks`}
        />
        <StatCard
          title="Module Progress"
          value={`${moduleProgress}%`}
          icon={Target}
          color="green"
          change={`${moduleStats.completed}/${moduleStats.total} modules`}
        />
        <StatCard
          title="Active Subjects"
          value={subjects.length}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Overdue Tasks"
          value={taskStats.overdue}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Task Progress */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overall Completion</span>
              <span className="font-semibold">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </CardContent>
        </Card>

        {/* Module Progress */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Module Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Study Module Completion</span>
              <span className="font-semibold">{moduleProgress}%</span>
            </div>
            <Progress value={moduleProgress} className="h-3" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {priorityData.length > 0 && (
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Task Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {taskTypeData.length > 0 && (
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Task Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Subject Progress */}
      {subjectProgress.length > 0 && (
        <Card className="mt-8 hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectProgress.map((subject, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>{subject.name}</span>
                  <span>
                    {subject.completed}/{subject.total} ({subject.progress}%)
                  </span>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Difficulty Distribution */}
      {difficultyData.length > 0 && (
        <Card className="mt-8 hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle>Module Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {tasks.length === 0 && modules.length === 0 && (
        <Card className="mt-8 text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No data to analyze yet
          </h3>
          <p className="text-gray-600">
            Add some tasks and modules to see your analytics here.
          </p>
        </Card>
      )}
    </div>
  );
}
