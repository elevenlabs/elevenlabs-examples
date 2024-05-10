import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Create } from "./pages/create";
import { Stream } from "./pages/stream";
import { Toaster } from "./components/ui/toaster";
import Carousel from "./pages/carousel";

function App() {
  const queryClient = new QueryClient();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Create />,
    },
    {
      path: "/stream/:id",
      element: <Stream />,
    },
    {
      path: "/carousel/:id",
      element: <Carousel />,
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
