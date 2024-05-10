import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Create } from "./pages/create";
import { Stream } from "./pages/stream";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  const queryClient = new QueryClient();

  const router = createBrowserRouter([
    { path: "/", element: <Create /> },
    {
      path: "/stream/:id",
      element: <Stream />,
    },
  ]);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
