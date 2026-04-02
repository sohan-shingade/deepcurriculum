import type { Metadata } from "next";
import { Source_Serif_4, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import "katex/dist/katex.min.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeepCurriculum | Graduate-Level Interactive Courses",
  description:
    "Graduate-level interactive courses with rigorous math, hands-on coding in the browser, and real production engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
