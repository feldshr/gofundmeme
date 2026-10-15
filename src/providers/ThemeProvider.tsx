import type { PropsWithChildren } from "react";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {children}
    </MantineProvider>
  );
};

export default ThemeProvider;

