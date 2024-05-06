import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/home";
import { Create } from "./pages/create";
import { Stream } from "./pages/stream";
import { Toaster } from "./components/ui/toaster";

function App() {
  const queryClient = new QueryClient();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    { path: "/create", element: <Create /> },
    {
      path: "/stream/:id/:lang_code",
      element: <Stream />,
    },
  ]);
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
