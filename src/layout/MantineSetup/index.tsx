"use client";

import theme from "@/theme";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextTopLoader from "nextjs-toploader";
import { grotesk } from "@/config/fonts";
import { Provider } from "react-redux";
import { persistor, store } from "@/store";
import { PersistGate } from "redux-persist/integration/react";

interface MantineSetupProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const MantineSetup = ({ children }: MantineSetupProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className={`${grotesk.className} ${grotesk.variable}`}>
          <ColorSchemeScript defaultColorScheme="dark" />
          <MantineProvider defaultColorScheme="dark" theme={theme}>
            <DatesProvider settings={{ firstDayOfWeek: 0 }}>
              <Notifications position="top-right" />
              <QueryClientProvider client={queryClient}>
                <NextTopLoader height={3} color="#5769E9" showSpinner={false} />
                {children}
              </QueryClientProvider>
            </DatesProvider>
          </MantineProvider>
        </div>
      </PersistGate>
    </Provider>
  );
};

export default MantineSetup;
