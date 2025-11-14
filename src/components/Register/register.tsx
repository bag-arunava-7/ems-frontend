import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Group,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export const AuthForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed!");
    }
  };

  return (
    <Stack gap="md">
      <Text fw={700} fz={26} ta="center">
        StaffHub Login
      </Text>

      {/* Email */}
      <TextInput
        label="Email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Password */}
      <PasswordInput
        label="Password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Login Button */}
      <Button fullWidth onClick={handleSubmit}>
        Login
      </Button>

      {/* Only Forgot Password */}
      <Group justify="center" mt="xs">
        <Anchor size="sm" onClick={() => navigate("/forgot-password")}>
          Forgot password?
        </Anchor>
      </Group>
    </Stack>
  );
};
