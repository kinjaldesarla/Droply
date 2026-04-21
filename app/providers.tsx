"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ImageKitProvider } from "imagekitio-next";
import { ToastContainer } from "react-toastify";
import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

// Create a context for ImageKit authentication
export const ImageKitAuthContext = createContext<{
  authenticate: () => Promise<{
    signature: string;
    token: string;
    expire: number;
  }>;
}>({
  authenticate: async () => ({ signature: "", token: "", expire: 0 }),
});

export const useImageKitAuth = () => useContext(ImageKitAuthContext);

// imagekit authenticator function
const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ImageKitProvider
        authenticator={authenticator}
        publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
      >
        <ImageKitAuthContext.Provider value={{ authenticate: authenticator }}>
          <NextThemesProvider {...themeProps}>
            {children}
             <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
            toastStyle={{
              background: "rgba(20, 20, 20, 0.6)",
              color: "#fff",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          />
            </NextThemesProvider>
        </ImageKitAuthContext.Provider>
      </ImageKitProvider>
    </HeroUIProvider>
  );
}
