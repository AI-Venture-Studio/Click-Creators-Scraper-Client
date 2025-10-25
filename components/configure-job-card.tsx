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

const platforms: { name: Platform; enabled: boolean }[] = [
  { name: 'Instagram', enabled: true },
  { name: 'Threads', enabled: false },
  { name: 'TikTok', enabled: false },
  { name: 'X', enabled: false },
];

export function ConfigureJobCard({ onSubmit, isSubmitting = false }: ConfigureJobCardProps) {
  const [influencer, setInfluencer] = useState('');
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [numVAs, setNumVAs] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { influencer, platform, numVAs });
    
    const numVAsInt = parseInt(numVAs) || 0;
    if (!influencer.trim() || !platform || numVAsInt < 1) {
      console.log('Form validation failed');
      return;
    }

    console.log('Calling onSubmit...');
    onSubmit({
      influencer: influencer.trim(),
      platform,
      numVAs: numVAsInt,
    });
  };

  const isValid = influencer.trim() && platform && numVAs && parseInt(numVAs) >= 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Scraping Campaign</CardTitle>
        <CardDescription>
          Set up a new scraping campaign
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
                  <SelectItem 
                    key={p.name} 
                    value={p.name}
                    disabled={!p.enabled}
                    className={!p.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {p.name}
                    {!p.enabled && <span className="ml-2 text-xs text-muted-foreground">(Coming soon)</span>}
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
              placeholder="Enter number of VAs"
              value={numVAs}
              onChange={(e) => setNumVAs(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
