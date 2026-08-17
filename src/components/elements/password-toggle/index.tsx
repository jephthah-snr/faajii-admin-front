"use client";

import { IconEye, IconEyeSlash } from "@/config/icons";

/**
 * Reveal/hide affordance for `PasswordInput`, wired in globally from the theme
 * so every password field gets it. Mirrors the app's `PasswordField`, which
 * uses the same Eye / EyeSlash pair.
 */
const PasswordToggleIcon = ({ reveal }: { reveal: boolean }) =>
  reveal ? (
    <IconEyeSlash size={20} color="var(--fj-text-secondary)" variant="Linear" />
  ) : (
    <IconEye size={20} color="var(--fj-text-secondary)" variant="Linear" />
  );

export default PasswordToggleIcon;
