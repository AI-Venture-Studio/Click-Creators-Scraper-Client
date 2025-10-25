"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createSupabaseClientWithContext } from "@/lib/supabase"
import { useBase } from "@/contexts/base-context"
import { useResetOnChange } from "@/hooks/use-page-reset"
import { AlertCircle } from "lucide-react"

interface Campaign {
  campaign_id: string
  campaign_date: string
  total_assigned: number
  status: boolean  // Changed from "success" | "failed" to boolean
  created_at: string
}

export function CampaignsTable() {
  const { baseId, isLoading: isLoadingBase } = useBase()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset component state when baseId changes (switching between jobs)
  useResetOnChange(baseId, () => {
    console.log('[CampaignsTable] Resetting state due to baseId change');
    setCampaigns([]);
    setIsLoading(true);
    setError(null);
  }, { skipInitial: true });

  useEffect(() => {
    if (!isLoadingBase && baseId) {
      fetchCampaigns()
    }
  }, [baseId, isLoadingBase])

  const fetchCampaigns = async () => {
    console.log('[CampaignsTable] fetchCampaigns called, baseId:', baseId)
    
    if (!baseId) {
      console.warn('[CampaignsTable] No baseId provided for fetching campaigns')
      setError('No active job found')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('[CampaignsTable] Fetching campaigns for base_id:', baseId)
      
      // Create a Supabase client with the base_id context
      const supabaseWithContext = createSupabaseClientWithContext(baseId)
      console.log('[CampaignsTable] Supabase client created')
      
      // Use the same pattern as edit-source-profiles-dialog: context-aware client + explicit filter
      const { data, error } = await supabaseWithContext
        .from('campaigns')
        .select('campaign_id, campaign_date, total_assigned, status, created_at')
        .eq('base_id', baseId) // Explicitly filter by base_id (belt-and-suspenders)
        .order('campaign_date', { ascending: false })
      
      console.log('[CampaignsTable] Query response:', { data, error })
      
      if (error) {
        console.error('[CampaignsTable] Supabase error:', error)
        throw error
      }
      
      console.log('[CampaignsTable] Campaigns loaded successfully:', data)
      setCampaigns(data || [])
      console.log('[CampaignsTable] State updated with campaigns')
    } catch (error) {
      console.error('[CampaignsTable] Error fetching campaigns:', error)
      setError('Failed to load campaigns')
    } finally {
      setIsLoading(false)
      console.log('[CampaignsTable] Loading complete')
    }
  }

  const getStatusDot = (status: boolean) => {
    // true = success (green), false = failed (red)
    const statusColor = status ? "bg-green-500" : "bg-red-500"
    const statusText = status ? "success" : "failed"
    
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${statusColor}`} />
        <span className="capitalize">{statusText}</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Loading campaign data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Failed to load campaign data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaigns</CardTitle>
        <CardDescription>
          View all campaign assignments and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table */}
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Total Assigned</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.campaign_id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">{formatDate(campaign.campaign_date)}</td>
                      <td className="p-3">{campaign.total_assigned.toLocaleString()}</td>
                      <td className="p-3">{getStatusDot(campaign.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Success - Distribution completed to all VA tables</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Failed - Distribution encountered errors</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
