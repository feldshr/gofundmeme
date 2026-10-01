import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { Box, rem } from "@mantine/core";
import Header from "../components/layout/Header/Header";
import Footer from "../components/layout/Footer/Footer";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  const router = useRouterState();
  return (
    <>
      <Box
        display="flex"
        flex={1}
        h="100%"
        style={{
          borderRadius: `0 0 ${rem(24)} ${rem(24)}`,
          overflow: "hidden",
          backgroundColor: "light-dark(#FFF, #0E0E11)",
          flexDirection: "column",
        }}
      >
        <Box w="100%" h="100%" flex={1} pos="relative">
          <Header />
          <Outlet />
        </Box>
      </Box>

      {router.location.pathname !== "/memefeed" && <Footer />}
    </>
  );
}
