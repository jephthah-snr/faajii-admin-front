import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";

import type { Metadata } from "next";
import "./globals.css";
import MantineSetup from "@/layout/MantineSetup";

export const metadata: Metadata = {
  title: {
    default: "Faajii Admin",
    template: "%s | Faajii Admin",
  },
  description: "Faajii administration portal by Trouve Technologies.",
  applicationName: "Faajii Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineSetup>{children}</MantineSetup>
      </body>
    </html>
  );
}
