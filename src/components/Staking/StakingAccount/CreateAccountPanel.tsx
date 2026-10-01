import { Button, Paper, Stack, Text } from "@mantine/core";
import { IconUserExclamation } from "@tabler/icons-react";

type CreateAccountPanelProps = {
  onCreate: () => void;
  loading: boolean;
};

const CreateAccountPanel = ({ onCreate, loading }: CreateAccountPanelProps) => (
  <Paper withBorder p="lg" radius="md" shadow="xs" w={600} maw="100%" m="auto">
    <Stack align="center">
      <IconUserExclamation size="5rem" stroke={1.5} />
      <Text size="lg" ta="center">
        looks like you don't have a staking account
      </Text>
      <Button
        fullWidth
        tt="uppercase"
        variant="light"
        onClick={onCreate}
        loading={loading}
      >
        create now
      </Button>
    </Stack>
  </Paper>
);

export default CreateAccountPanel;
