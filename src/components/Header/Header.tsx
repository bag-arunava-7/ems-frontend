import React from "react";
import {
  Group,
  Text,
  Menu,
  Avatar,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";
import { IconChevronDown, IconSun, IconMoon } from "@tabler/icons-react";

const Header = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth"; // 🔥 LOGIN PAGE
  };

  return (
    <Group
      h={60}
      px="md"
      bg="white"
      style={{
        borderBottom: "1px solid #e5e5e5",
        justifyContent: "space-between",
      }}
    >
      {/* App Name */}
      <Text fw={700} fz="xl">
        StaffHub
      </Text>

      <Group>
        {/* 🔥 Theme Toggle */}
        <ActionIcon
          onClick={() => toggleColorScheme()}
          variant="light"
          size="lg"
          radius="md"
        >
          {dark ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>

        {/* User Menu */}
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Group style={{ cursor: "pointer" }}>
              <Avatar radius="xl" />
              <ActionIcon variant="subtle">
                <IconChevronDown size={18} />
              </ActionIcon>
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={() => (window.location.href = "/profile")}>
              Profile
            </Menu.Item>

            <Menu.Item color="red" onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default Header;
