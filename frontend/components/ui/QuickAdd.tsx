"use client";

import { useState } from "react";
import { Plus, ClipboardList, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";

export default function QuickAdd() {
  const { addTask, addEvent, addModule } = useApp();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"task" | "event" | "module">("task");
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;

    if (type === "task") {
      addTask({
        id: Date.now().toString(),
        title,
        completed: false,
        dueDate: new Date().toISOString(),
        priority: "Medium",
      });
    } else if (type === "event") {
      addEvent({
        id: Date.now().toString(),
        title,
        date: new Date().toISOString(),
        time: "10:00",
        type: "Meeting",
      });
    } else if (type === "module") {
      addModule({
        id: Date.now().toString(),
        name: title,
        subjectId: "",
        difficulty: "Medium",
        estimatedHours: 2,
        completed: false,
      });
    }

    setTitle("");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full p-4 shadow-lg bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <Button variant={type === "task" ? "default" : "outline"} onClick={() => setType("task")} size="sm">
              <ClipboardList className="w-4 h-4 mr-1" /> Task
            </Button>
            <Button variant={type === "event" ? "default" : "outline"} onClick={() => setType("event")} size="sm">
              <Calendar className="w-4 h-4 mr-1" /> Event
            </Button>
            <Button variant={type === "module" ? "default" : "outline"} onClick={() => setType("module")} size="sm">
              <BookOpen className="w-4 h-4 mr-1" /> Module
            </Button>
          </div>
          <Input
            placeholder={`Enter ${type} name`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button onClick={handleAdd} className="w-full mt-3">
            Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
