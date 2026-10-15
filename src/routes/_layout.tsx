import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { Box, Progress } from "@mantine/core";
import Header from "../components/layout/Header/Header";
import Footer from "../components/layout/Footer/Footer";
import PageNotFound from "../components/PageNotFound/PageNotFound";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
  notFoundComponent: PageNotFound,
});

function LayoutComponent() {
  const isNavigating = useRouterState({
    select: (s) => s.status === "pending",
  });

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      {isNavigating && (
        <Progress
          value={100}
          animated
          striped
          size="xs"
          radius={0}
          pos="fixed"
          top={0}
          left={0}
          w="100%"
          style={{ zIndex: 9999 }}
        />
      )}
      <Box className="layout">
        <Header />
        <Box component="main" id="main-content" className="main">
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </>
  );
}
