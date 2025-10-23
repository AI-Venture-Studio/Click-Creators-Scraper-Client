"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DependenciesCard } from "@/components/dependencies-card"
import { PaymentsTable } from "@/components/payments-table"
import { CampaignsTable } from "@/components/campaigns-table"
import { UsernameStatusCard } from "@/components/username-status-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { AssignmentProgressProvider } from "@/contexts/assignment-progress-context"
import { GlobalAssignmentProgress } from "@/components/global-assignment-progress"
import { useSidebar } from "@/components/ui/sidebar"
import { getJobById } from "@/lib/scraping-jobs"
import type { ScrapingJob } from "@/types/scraping-jobs"

interface ScrapedAccount {
  id: string
  fullName: string
  username: string
}

function DashboardContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { open, toggleSidebar } = useSidebar()
  const [scrapedAccounts, setScrapedAccounts] = useState<ScrapedAccount[]>([])
  const [totalFiltered, setTotalFiltered] = useState(0)
  const [isScrapingLoading, setIsScrapingLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [canAssignToVAs, setCanAssignToVAs] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null)

  // Check if we're viewing a specific job
  const jobId = searchParams.get('job')

  useEffect(() => {
    if (jobId) {
      // Fetch job details
      getJobById(jobId).then(job => {
        if (job) {
          setCurrentJob(job)
        }
      })
    }
  }, [jobId])

    const handleUsernameStatusChange = useCallback((isReady: boolean, unusedCount: number, message: string) => {
    setCanAssignToVAs(isReady)
    setStatusMessage(message)
  }, [])

  const handleScrapingStart = () => {
    setIsScrapingLoading(true)
    setScrapedAccounts([])
    setTotalFiltered(0)
  }

  const handleScrapingComplete = (accounts: ScrapedAccount[], total: number) => {
    setScrapedAccounts(accounts)
    setTotalFiltered(total)
    setIsScrapingLoading(false)
  }

  const handleScrapingError = (_error: string) => {
    setIsScrapingLoading(false)
    setScrapedAccounts([])
    setTotalFiltered(0)
  }

  const handleCampaignComplete = () => {
    // Trigger refresh of campaigns table and username status card
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/callum")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <p>Loading...</p>
      </div>
    )
  }

  // Don't show dashboard if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <p>Redirecting to login...</p>
      </div>
    )
  }
  return (
    <AssignmentProgressProvider>
      <GlobalAssignmentProgress />
      
      {/* Header with optional sidebar trigger */}
      <header className="flex items-center justify-between px-6 py-3">
        {!open && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={toggleSidebar}>
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src="/aivs logo.JPG"
                alt="AIVS Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
      </header>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Show job info if viewing specific job */}
          {currentJob && (
            <div className="mb-6 p-4 border rounded-lg bg-card">
              <h2 className="text-xl font-semibold mb-2">
                {currentJob.influencer_name}'s {currentJob.platform.charAt(0).toUpperCase() + currentJob.platform.slice(1)} Job
              </h2>
              <p className="text-sm text-muted-foreground">
                Base ID: {currentJob.airtable_base_id} • VAs: {currentJob.num_vas || 'Not set'} • Status: {currentJob.status}
              </p>
            </div>
          )}
          
          {/* Show message if no job is selected */}
          {!jobId && (
            <div className="mb-6 p-8 border-2 border-dashed rounded-lg bg-muted/50 text-center">
              <h2 className="text-xl font-semibold mb-2">No Job Selected</h2>
              <p className="text-muted-foreground mb-4">
                Please select a scraping job from the sidebar to view its dashboard.
              </p>
              <Button onClick={() => router.push('/instagram-jobs')}>
                View Instagram Jobs
              </Button>
            </div>
          )}
          
          {/* Only show content if a job is selected */}
          {jobId && currentJob && (
            <>
              {/* Username Status Card */}
              <div className="mb-6">
                <UsernameStatusCard 
                  key={`username-status-${refreshKey}`}
                  onStatusChange={handleUsernameStatusChange}
                  baseId={currentJob.airtable_base_id}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DependenciesCard 
                  onScrapingStart={handleScrapingStart}
                  onScrapingComplete={handleScrapingComplete}
                  onError={handleScrapingError}
                  baseId={currentJob.airtable_base_id}
                />
                
                {/* Tabs for Scraped Accounts and Campaigns */}
                <Tabs defaultValue="payments" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payments">Scraped Accounts</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  </TabsList>
                  <TabsContent value="payments">
                    <PaymentsTable 
                      accounts={scrapedAccounts}
                      totalFiltered={totalFiltered}
                      isLoading={isScrapingLoading}
                      onCampaignComplete={handleCampaignComplete}
                      canAssignToVAs={canAssignToVAs}
                      statusMessage={statusMessage}
                    />
                  </TabsContent>
                  <TabsContent value="campaigns">
                    <CampaignsTable 
                      key={`campaigns-${refreshKey}`}
                      baseId={currentJob.airtable_base_id}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
          
          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-muted-foreground">
            Built by AIVS, 2025
          </footer>
        </div>
      </div>
    </AssignmentProgressProvider>
  )
}

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <DashboardContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
