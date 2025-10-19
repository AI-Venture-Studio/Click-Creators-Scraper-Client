'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AirtableLinkDialogProps {
  open: boolean;
  onSubmit: (link: string) => void;
  onCancel: () => void;
  influencerName: string;
  platform: string;
}

export function AirtableLinkDialog({ 
  open, 
  onSubmit, 
  onCancel, 
  influencerName, 
  platform 
}: AirtableLinkDialogProps) {
  const [airtableLink, setAirtableLink] = useState('');
  const [error, setError] = useState('');

  const validateAirtableLink = (link: string): boolean => {
    // Basic validation for Airtable URL pattern
    const airtablePattern = /^https?:\/\/(airtable\.com|www\.airtable\.com)\/.+/i;
    return airtablePattern.test(link);
  };

  const handleSubmit = () => {
    const trimmedLink = airtableLink.trim();
    
    if (!trimmedLink) {
      setError('Airtable link is required');
      return;
    }

    if (!validateAirtableLink(trimmedLink)) {
      setError('Please enter a valid Airtable URL');
      return;
    }

    setError('');
    onSubmit(trimmedLink);
    setAirtableLink('');
  };

  const handleCancel = () => {
    setAirtableLink('');
    setError('');
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle>Connect Airtable Base</DialogTitle>
          <DialogDescription className="space-y-4 pt-2">
            <p>Please create a new Airtable base in the <strong>AIVS Scraper Workspace</strong> before proceeding.</p>
            
            <div className="space-y-2 text-sm">
              <p className="font-medium">Follow these steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Navigate to <strong>AIVS Scraper Workspace</strong></li>
                <li>Click on <strong>"Create"</strong></li>
                <li>Select <strong>"Build an app on your own"</strong></li>
                <li>Rename the base to:
                  <div className="mt-2 p-2 bg-muted rounded-md font-mono text-xs">
                    {influencerName}'s {platform} Job
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: "FitMomGhana's Instagram Job"
                  </p>
                </li>
              </ol>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="airtable-link">Airtable Base Link</Label>
            <Input
              id="airtable-link"
              placeholder="https://airtable.com/..."
              value={airtableLink}
              onChange={(e) => {
                setAirtableLink(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!airtableLink.trim()}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
