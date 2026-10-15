import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Box } from "@mantine/core";
import Header from "../components/layout/Header/Header";
import Footer from "../components/layout/Footer/Footer";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <>
      <Box className="layout">
        <Header />
        <Box component="main" flex={1} pos="relative">
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </>
  );
}
