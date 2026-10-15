import { Container } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";
import Staking from "../../components/Staking";

export const Route = createLazyFileRoute("/_layout/")({
  component: Index,
});

function Index() {
  return (
    <Container
      size="md"
      my="md"
      px={{
        xs: "md",
        sm: "xl",
      }}
    >
      <Staking />
    </Container>
  );
}
