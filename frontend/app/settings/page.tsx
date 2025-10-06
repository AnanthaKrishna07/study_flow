'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { Settings, Target, Activity, LogOut } from 'lucide-react';
import Sidebar from '@/components/ui/Sidebar';
import { signOut } from 'next-auth/react';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

type SettingsType = {
  studyHoursPerDay: number;
  preferredStudyTimes: string[];
  difficultyWeights: Record<Difficulty, number>;
  dailyGoalHours: number; // new feature
};

const defaultSettings: SettingsType = {
  studyHoursPerDay: 2,
  preferredStudyTimes: [],
  difficultyWeights: { Easy: 1, Medium: 1, Hard: 1 },
  dailyGoalHours: 4,
};

const LOCAL_STORAGE_KEY = 'studyflow_settings';

export default function SettingsPage() {
  const appContext = useApp();

  const { settings: contextSettings, setSettings, tasks = [] } =
    (appContext || {}) as any;

  // Load settings: context > localStorage > defaults
  const loadInitialSettings = (): SettingsType => {
    if (contextSettings) return contextSettings as SettingsType;
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem(LOCAL_STORAGE_KEY)
          : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.studyHoursPerDay === 'number')
          return parsed as SettingsType;
      }
    } catch {}
    return defaultSettings;
  };

  const [localSettings, setLocalSettings] = useState<SettingsType>(
    loadInitialSettings
  );

  // Simulated study progress (based on completed tasks)
  const completedHours = Math.min(
    tasks.filter((t: any) => t.completed).length * 0.5,
    localSettings.dailyGoalHours
  );
  const progress =
    (completedHours / localSettings.dailyGoalHours) * 100 || 0;

  useEffect(() => {
    if (contextSettings)
      setLocalSettings(contextSettings as SettingsType);
  }, [contextSettings]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSettings));
      }
    } catch {}
  }, [localSettings]);

  const handleSaveSettings = () => {
    if (typeof setSettings === 'function') {
      setSettings(localSettings);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSettings));
    alert('✅ Settings saved successfully!');
  };

  const handleStudyHoursChange = (value: number[]) =>
    setLocalSettings((prev) => ({ ...prev, studyHoursPerDay: value[0] }));

  const handleDifficultyWeightChange = (
    difficulty: Difficulty,
    value: number[]
  ) =>
    setLocalSettings((prev) => ({
      ...prev,
      difficultyWeights: { ...prev.difficultyWeights, [difficulty]: value[0] },
    }));

  const handleDailyGoalChange = (value: number[]) =>
    setLocalSettings((prev) => ({ ...prev, dailyGoalHours: value[0] }));

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch {
      window.location.href = '/login';
    }
  };

  const motivationalMessage =
    progress >= 100
      ? 'Excellent! You reached your study goal today!'
      : progress >= 50
      ? 'Keep going! You’re halfway there!'
      : 'Let’s get started on your goals!';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex">
      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/studyflow-bg.jpg')] bg-cover bg-center opacity-20 blur-sm"
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="relative z-20 w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8 backdrop-blur-sm bg-white/70 rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">
              Customize your StudyFlow experience and manage your preferences.
            </p>
          </div>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" /> General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Study Hours */}
              <div className="space-y-3">
                <Label>
                  Study Hours Per Day: {localSettings.studyHoursPerDay} hours
                </Label>
                <Slider
                  value={[localSettings.studyHoursPerDay]}
                  onValueChange={handleStudyHoursChange}
                  max={12}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">
                  Set your daily study target to optimize your schedule.
                </p>
              </div>

              {/* Preferred Study Times */}
              <div>
                <Label className="mb-3 block">Preferred Study Times</Label>
                <div className="flex flex-wrap gap-2">
                  {localSettings.preferredStudyTimes.length ? (
                    localSettings.preferredStudyTimes.map((time, index) => (
                      <Badge key={index} variant="secondary">
                        {time}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No preferred times set
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Weights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" /> Difficulty Weights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Adjust time multipliers for different module difficulties.
              </p>
              {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                <div key={level}>
                  <Label>
                    {level} Modules: {localSettings.difficultyWeights[level]}x
                  </Label>
                  <Slider
                    value={[localSettings.difficultyWeights[level]]}
                    onValueChange={(value) =>
                      handleDifficultyWeightChange(level, value)
                    }
                    max={3}
                    min={0.5}
                    step={0.1}
                    className="w-full mt-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* NEW: Daily Study Goal Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" /> Daily Study Goal Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Label>
                Daily Goal: {localSettings.dailyGoalHours} hours
              </Label>
              <Slider
                value={[localSettings.dailyGoalHours]}
                onValueChange={handleDailyGoalChange}
                max={10}
                min={1}
                step={0.5}
                className="w-full"
              />

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Your current progress today:
                </p>
                <Progress value={progress} className="h-3" />
                <p className="text-center text-sm mt-2">{motivationalMessage}</p>
              </div>
            </CardContent>
          </Card>

          {/* Save + Logout */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
            <Button onClick={handleSaveSettings} size="lg" className="flex-1">
              Save Settings
            </Button>

            <Button
              onClick={handleLogout}
              size="lg"
              variant="outline"
              className="flex-1 text-red-600 border-red-600 hover:bg-red-100"
            >
              <LogOut className="h-5 w-5 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
