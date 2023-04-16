import "styles/globals.css";
import AppContextProvider from "context/AppReducer";
import type { AppProps } from "next/app";
import AppLayout from "components/AppLayout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppContextProvider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </AppContextProvider>
  );
}
