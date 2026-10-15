import { createFileRoute } from "@tanstack/react-router";
import PageNotFound from "../../components/PageNotFound/PageNotFound";

export const Route = createFileRoute("/_layout/$")({
  component: PageNotFound,
  head: () => ({
    meta: [{ title: "404 - Page Not Found | GoFundMeme" }],
  }),
});

