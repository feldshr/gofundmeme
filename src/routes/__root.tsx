import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Box } from "@mantine/core";
import { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <Box
      className="App"
      style={{
        minHeight: "100dvh",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Outlet />
    </Box>
  );
}
