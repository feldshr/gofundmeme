import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../router";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const Router = () => {
  return <RouterProvider router={router} />;
};
