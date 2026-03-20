import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GandaBot — AI-Powered Luganda Learning", template: "%s | GandaBot" },
  description: "Learn Luganda and explore African culture with your AI-powered companion. Pronunciation coaching, community forum, podcast hub, and more.",
  keywords: ["Luganda", "African language", "Uganda", "AI learning", "language app"],
  openGraph: {
    siteName: "GandaBot",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://www.gandabot.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
