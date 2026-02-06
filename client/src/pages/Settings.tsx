import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Settings as SettingsIcon,
  Database,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Settings() {
  const { user } = useAuth();
  const [seedingVpp, setSeedingVpp] = useState(false);
  const [seedingRebates, setSeedingRebates] = useState(false);
  
  const seedVpp = trpc.admin.seedVppProviders.useMutation({
    onSuccess: (data) => {
      toast.success(`Seeded ${data.count} VPP providers`);
      setSeedingVpp(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setSeedingVpp(false);
    }
  });
  
  const seedRebates = trpc.admin.seedRebates.useMutation({
    onSuccess: (data) => {
      toast.success(`Seeded ${data.count} state rebates`);
      setSeedingRebates(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setSeedingRebates(false);
    }
  });

  const isAdmin = user?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="lightning-text-gradient">Settings</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage application settings and data
          </p>
        </div>

        {/* User Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user?.role || "user"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {isAdmin && (
          <Card className="bg-card border-border border-l-2 border-l-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-accent" />
                Admin Tools
              </CardTitle>
              <CardDescription>
                Database management and seed data operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seed VPP Providers */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">VPP Providers</h4>
                  <p className="text-sm text-muted-foreground">
                    Seed the 13 nationwide VPP providers with program details
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setSeedingVpp(true);
                    seedVpp.mutate();
                  }}
                  disabled={seedingVpp}
                  variant="outline"
                >
                  {seedingVpp ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Seed VPP Data
                    </>
                  )}
                </Button>
              </div>

              {/* Seed State Rebates */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">State Rebates</h4>
                  <p className="text-sm text-muted-foreground">
                    Seed state-specific rebates for solar, battery, and heat pumps
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setSeedingRebates(true);
                    seedRebates.mutate();
                  }}
                  disabled={seedingRebates}
                  variant="outline"
                >
                  {seedingRebates ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Seed Rebates
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Non-Admin Notice */}
        {!isAdmin && (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Admin Access Required</h4>
                <p className="text-sm text-muted-foreground">
                  Contact an administrator to access database management tools.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* About Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src="/LightningEnergy_Logo_Icon_Aqua.png" 
                alt="Lightning Energy" 
                className="h-16 w-16"
              />
              <div>
                <h3 className="text-xl font-extrabold lightning-text-gradient">
                  Lightning Energy
                </h3>
                <p className="text-sm text-muted-foreground">
                  Proposal Generator Dashboard
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                This application streamlines the creation of residential electrification proposals 
                by automating data extraction, calculations, and slide generation.
              </p>
            </div>
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>AI-powered bill data extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Automated savings calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>VPP provider comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Professional slide generation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          COPYRIGHT Lightning Energy - Architect George Fotopoulos
        </div>
      </div>
    </DashboardLayout>
  );
}
