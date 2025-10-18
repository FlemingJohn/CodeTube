
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/lib/types';

interface ShareDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  course: Course;
}

export default function ShareDialog({ isOpen, setIsOpen, course }: ShareDialogProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = React.useState('');

  React.useEffect(() => {
    if (course.id && typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/course/${course.id}`);
    }
  }, [course.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied to Clipboard!',
      description: 'The course URL has been copied.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Share Your Course</DialogTitle>
          <DialogDescription>
            Anyone with this link can view your course.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input id="link" value={shareUrl} readOnly />
          <Button type="button" size="sm" className="px-3" onClick={copyToClipboard}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
