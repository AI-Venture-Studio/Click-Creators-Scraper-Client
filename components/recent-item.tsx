'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RecentJob, removeRecent } from '@/lib/recents';
import { useToast } from '@/hooks/use-toast';

interface RecentItemProps {
  job: RecentJob;
  onDelete: () => void;
}

export function RecentItem({ job, onDelete }: RecentItemProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = () => {
    router.push(`/callum-dashboard/${job.jobId}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecent(job.jobId);
    onDelete();
    toast({
      title: 'Removed from Recents',
      description: `${job.influencer} has been removed from your recent jobs.`,
    });
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{job.influencer}</p>
        <p className="text-xs text-muted-foreground">{job.platform}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
