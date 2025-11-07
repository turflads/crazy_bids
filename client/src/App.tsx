import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import Login from "@/pages/Login";
import SuperAdmin from "@/pages/SuperAdmin";
import Admin from "@/pages/Admin";
import Owner from "@/pages/Owner";
import Viewer from "@/pages/Viewer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/superadmin" component={SuperAdmin} />
      <Route path="/admin" component={Admin} />
      <Route path="/owner" component={Owner} />
      <Route path="/viewer" component={Viewer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WebSocketProvider>
          <Toaster />
          <Router />
        </WebSocketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
