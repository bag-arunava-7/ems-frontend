import { Outlet } from "react-router-dom";
import { Container, Paper, Center, Box, Text, Group, ThemeIcon } from "@mantine/core";
import {
  IconBrandNodejs,
  IconBrandReact,
  IconBrandTypescript,
} from "@tabler/icons-react";

export default function AuthLayout() {
  return (
    <Center
      h="100vh"
      style={{
        backgroundColor: "#f7f7ff",
      }}
    >
      <Container size={420}>
        <Paper shadow="md" radius="md" p="xl" withBorder>

          {/* THIS IS WHERE LOGIN OR REGISTER SHOWS */}
          <Outlet />

          {/* FOOTER — SHOWS FOR BOTH LOGIN + REGISTER */}
          <Box mt="xl">
            <Text ta="center" c="dimmed" fz="sm">
              Made with ❤️ by Arunava Bag
            </Text>

            <Group justify="center" mt="xs">
              <Group gap={5}>
                <ThemeIcon color="cyan" variant="light" radius="xl" size={30}>
                  <IconBrandNodejs size={18} />
                </ThemeIcon>
                <Text size="xs">Node.js</Text>
              </Group>

              <Group gap={5}>
                <ThemeIcon color="blue" variant="light" radius="xl" size={30}>
                  <IconBrandReact size={18} />
                </ThemeIcon>
                <Text size="xs">React</Text>
              </Group>

              <Group gap={5}>
                <ThemeIcon color="indigo" variant="light" radius="xl" size={30}>
                  <IconBrandTypescript size={18} />
                </ThemeIcon>
                <Text size="xs">TypeScript</Text>
              </Group>
            </Group>
          </Box>

        </Paper>
      </Container>
    </Center>
  );
}
