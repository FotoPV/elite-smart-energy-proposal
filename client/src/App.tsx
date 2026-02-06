import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Proposals from "./pages/Proposals";
import ProposalDetail from "./pages/ProposalDetail";
import NewProposal from "./pages/NewProposal";
import Settings from "./pages/Settings";
import CustomerPortal from "./pages/CustomerPortal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/customers" component={Customers} />
      <Route path="/customers/:id" component={CustomerDetail} />
      <Route path="/proposals" component={Proposals} />
      <Route path="/proposals/new" component={NewProposal} />
      <Route path="/proposals/:id" component={ProposalDetail} />
      <Route path="/settings" component={Settings} />
      <Route path="/portal/:token" component={CustomerPortal} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            theme="dark"
            toastOptions={{
              style: {
                background: 'oklch(10% 0 0)',
                border: '1px solid oklch(22% 0 0)',
                color: 'oklch(95% 0 0)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
