import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Box, Button, Container, Stack, Text, Title } from "@mantine/core";
import type { QueryClient } from "@tanstack/react-query";
import PageNotFound from "../components/PageNotFound/PageNotFound";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { property: "og:site_name", content: "GoFundMeme" },
      { name: "theme-color", content: "#121216" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
  component: RootComponent,
  notFoundComponent: PageNotFound,
  errorComponent: RootErrorComponent,
});

function RootErrorComponent({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title order={3}>Something went wrong</Title>
        <Text c="dimmed" size="sm" ta="center">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </Text>
        <Button variant="light" color="red" onClick={reset}>
          Try again
        </Button>
      </Stack>
    </Container>
  );
}

function RootComponent() {
  return (
    <Box className="App">
      <HeadContent />
      <Outlet />
      <ScrollRestoration />
    </Box>
  );
}
