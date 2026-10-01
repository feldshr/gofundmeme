import type { FC, PropsWithChildren } from "react";
import { createTheme, MantineProvider, Tooltip } from "@mantine/core";

const theme = createTheme({
  fontFamily: "Fredoka, serif",
  black: "#000",
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5C5F66",
      "#373A40",
      "#2C2E33",
      "#25262B",
      "#121212",
      "#141517",
      "#101113",
    ],
  },
  components: {
    Divider: {
      styles: {
        root: {
          borderColor: "light-dark(#F4F4F6, #1C1C22)",
        },
      },
    },
    Tooltip: Tooltip.extend({
      defaultProps: {
        events: {
          hover: true,
          focus: true,
          touch: true,
        },
        withArrow: true,
        multiline: true,
      },
    }),
  },
});

export const MantineService: FC<PropsWithChildren> = ({ children }) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {children}
    </MantineProvider>
  );
};
