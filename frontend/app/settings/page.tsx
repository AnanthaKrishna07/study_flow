'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { Settings, Target, Download, Upload, Trash2 } from 'lucide-react';

const defaultSettings = {
  emailReminders: false,
  studyHoursPerDay: 2,
  preferredStudyTimes: [],
  difficultyWeights: { Easy: 1, Medium: 1, Hard: 1 }
};

export default function SettingsPage() {
  const {
    settings,
    setSettings,
    tasks = [],
    events = [],
    modules = [],
    subjects = [],
    setTasks,
    setEvents,
    setModules,
    setSubjects
  } = useApp();

  const [localSettings, setLocalSettings] = useState(settings || defaultSettings);

  useEffect(() => {
    setLocalSettings(settings || defaultSettings);
  }, [settings]);

  const handleSaveSettings = () => {
    setSettings(localSettings);
    alert('Settings saved successfully!');
  };

  const handleStudyHoursChange = (value: number[]) => {
    setLocalSettings({ ...localSettings, studyHoursPerDay: value[0] });
  };

  const handleDifficultyWeightChange = (
    difficulty: 'Easy' | 'Medium' | 'Hard',
    value: number[]
  ) => {
    setLocalSettings({
      ...localSettings,
      difficultyWeights: {
        ...localSettings.difficultyWeights,
        [difficulty]: value[0]
      }
    });
  };

  const exportData = () => {
    const data = {
      tasks,
      events,
      modules,
      subjects,
      settings: localSettings,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.tasks) setTasks(data.tasks);
        if (data.events) setEvents(data.events);
        if (data.modules) setModules(data.modules);
        if (data.subjects) setSubjects(data.subjects);
        if (data.settings) {
          setLocalSettings(data.settings);
          setSettings(data.settings);
        }

        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (
      confirm('Are you sure you want to clear all data? This action cannot be undone.')
    ) {
      setTasks([]);
      setEvents([]);
      setModules([]);
      setSubjects([]);
      alert('All data has been cleared.');
    }
  };

  const dataStats = {
    tasks: tasks.length,
    events: events.length,
    modules: modules.length,
    subjects: subjects.length
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your StudyFlow experience and manage your data.
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-reminders">Email Reminders</Label>
              <p className="text-sm text-gray-600 mt-1">
                Receive email notifications for upcoming events and deadlines
              </p>
            </div>
            <Switch
              id="email-reminders"
              checked={localSettings?.emailReminders ?? false}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, emailReminders: checked })
              }
            />
          </div>

          <div className="space-y-3">
            <Label>
              Study Hours Per Day: {localSettings?.studyHoursPerDay ?? 0} hours
            </Label>
            <Slider
              value={[localSettings?.studyHoursPerDay ?? 0]}
              onValueChange={handleStudyHoursChange}
              max={12}
              min={1}
              step={0.5}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Set your target daily study hours for better scheduling
            </p>
          </div>

          <div>
            <Label className="mb-3 block">Preferred Study Times</Label>
            <div className="flex flex-wrap gap-2">
              {localSettings?.preferredStudyTimes?.length
                ? localSettings.preferredStudyTimes.map((time, index) => (
                    <Badge key={index} variant="secondary">
                      {time}
                    </Badge>
                  ))
                : <p className="text-sm text-gray-500">No preferred times set</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Difficulty Weights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            Adjust how much time multiplier is applied to different difficulty levels
          </p>

          {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
            <div key={level}>
              <Label>
                {level} Modules: {localSettings?.difficultyWeights?.[level] ?? 1}x
              </Label>
              <Slider
                value={[localSettings?.difficultyWeights?.[level] ?? 1]}
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

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{dataStats.tasks}</p>
              <p className="text-sm text-gray-600">Tasks</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{dataStats.events}</p>
              <p className="text-sm text-gray-600">Events</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{dataStats.modules}</p>
              <p className="text-sm text-gray-600">Modules</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{dataStats.subjects}</p>
              <p className="text-sm text-gray-600">Subjects</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Button onClick={exportData} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>

            <div className="flex-1">
              <Input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-data"
              />
              <Button asChild variant="outline" className="w-full">
                <Label
                  htmlFor="import-data"
                  className="cursor-pointer flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Label>
              </Button>
            </div>

            <Button onClick={clearAllData} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
