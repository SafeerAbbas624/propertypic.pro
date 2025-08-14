import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PropertyMediaUpload from "@/pages/PropertyMediaUpload";
import PropertyCreated from "@/pages/PropertyCreated";
import FileBrowser from "@/pages/FileBrowser";
import { AdminSetup } from "@/pages/AdminSetup";
import { InspectionProvider } from "@/context/InspectionContext";
import Login from "@/pages/Login";
import Protected from "@/components/Protected";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/home" component={() => (
        <Protected>
          <Home />
        </Protected>
      )} />
      {/* Public upload route: no login required */}
      <Route path="/upload/:token" component={PropertyMediaUpload} />
      {/* Property created confirmation page: protected route */}
      <Route path="/property-created/:token" component={() => (
        <Protected>
          <PropertyCreated />
        </Protected>
      )} />
      <Route path="/browse" component={() => (
        <Protected>
          <FileBrowser />
        </Protected>
      )} />
      <Route path="/admin" component={() => (
        <Protected>
          <AdminSetup />
        </Protected>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InspectionProvider>
          <Toaster />
          <Router />
        </InspectionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
