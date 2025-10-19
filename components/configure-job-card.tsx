'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Platform } from '@/lib/recents';

interface ConfigureJobCardProps {
  onSubmit: (data: { influencer: string; platform: Platform; numVAs: number }) => void;
  isSubmitting?: boolean;
}

const platforms: Platform[] = ['Instagram', 'Threads', 'TikTok', 'X'];

export function ConfigureJobCard({ onSubmit, isSubmitting = false }: ConfigureJobCardProps) {
  const [influencer, setInfluencer] = useState('');
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [numVAs, setNumVAs] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { influencer, platform, numVAs });
    
    if (!influencer.trim() || !platform || numVAs < 1) {
      console.log('Form validation failed');
      return;
    }

    console.log('Calling onSubmit...');
    onSubmit({
      influencer: influencer.trim(),
      platform,
      numVAs,
    });
  };

  const isValid = influencer.trim() && platform && numVAs >= 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Scraping Job</CardTitle>
        <CardDescription>
          Set up a new scraping job
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="influencer">Influencer Name</Label>
            <Input
              id="influencer"
              placeholder="Enter influencer name"
              value={influencer}
              onChange={(e) => setInfluencer(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={platform}
              onValueChange={(value) => setPlatform(value as Platform)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numVAs">Number of VAs</Label>
            <Input
              id="numVAs"
              type="number"
              min="1"
              value={numVAs}
              onChange={(e) => setNumVAs(parseInt(e.target.value) || 1)}
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Creating Job...' : 'Create Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
