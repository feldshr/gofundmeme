import { Group, Select, Text } from "@mantine/core";
import { useRoot } from "../../../../services/hooks";
import { EXPLORER_SELECT_DATA, type ExplorerKey } from "../../../../constants";

export const ExplorerSetting = () => {
  const { explorer, setExplorer } = useRoot();

  return (
    <Group wrap="nowrap" align="center" justify="space-between">
      <Text lh="inherit" fz="inherit" fw="inherit">
        Explorer
      </Text>
      <Select
        w={172}
        value={explorer}
        allowDeselect={false}
        onChange={(value) => {
          if (!value) return;
          setExplorer(value as ExplorerKey);
        }}
        data={EXPLORER_SELECT_DATA}
        comboboxProps={{ withinPortal: false }}
      />
    </Group>
  );
};
