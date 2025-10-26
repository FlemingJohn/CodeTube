
'use client';

import { Eye, Video, Edit, PanelLeft, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useFocusMode } from '@/hooks/use-focus-mode';

export default function FocusModeToggle() {
  const { settings, setSetting } = useFocusMode();

  const focusOptions = [
    { id: 'showSidebar', label: 'Chapter List', icon: <PanelLeft className="w-4 h-4" /> },
    { id: 'showVideo', label: 'Video Player', icon: <Video className="w-4 h-4" /> },
    { id: 'showAiTools', label: 'AI Tools', icon: <Bot className="w-4 h-4" /> },
    { id: 'showEditor', label: 'Chapter Editor', icon: <Edit className="w-4 h-4" /> },
  ] as const;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-5 w-5" />
          <span className="sr-only">Focus Mode</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none font-headline">Focus Mode</h4>
            <p className="text-sm text-muted-foreground">
              Toggle UI elements to reduce distractions.
            </p>
          </div>
          <div className="grid gap-2">
            {focusOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-accent">
                <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                  {option.icon}
                  {option.label}
                </Label>
                <Switch
                  id={option.id}
                  checked={settings[option.id]}
                  onCheckedChange={(checked) => setSetting(option.id, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
