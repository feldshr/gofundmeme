import {
  Center,
  Group,
  SegmentedControl,
  Text,
  useMantineColorScheme,
  type MantineColorScheme,
  type SegmentedControlItem,
} from "@mantine/core";
import {
  IconSunMoon,
  IconSunFilled,
  IconMoonFilled,
} from "@tabler/icons-react";

const THEME_OPTIONS: SegmentedControlItem[] = [
  {
    value: "auto",
    label: (
      <Center style={{ gap: 2 }}>
        <IconSunMoon size={14} />
        <span>Auto</span>
      </Center>
    ),
  },
  {
    value: "light",
    label: (
      <Center style={{ gap: 2 }}>
        <IconSunFilled size={14} />
        <span>Light</span>
      </Center>
    ),
  },
  {
    value: "dark",
    label: (
      <Center style={{ gap: 2 }}>
        <IconMoonFilled size={14} />
        <span>Dark</span>
      </Center>
    ),
  },
] as const;

export const ThemeSetting = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Group wrap="nowrap" justify="space-between">
      <Text>Theme</Text>
      <SegmentedControl
        size="xs"
        radius="sm"
        data={THEME_OPTIONS}
        value={colorScheme}
        onChange={(value) => {
          setColorScheme(value as MantineColorScheme);
        }}
      />
    </Group>
  );
};
