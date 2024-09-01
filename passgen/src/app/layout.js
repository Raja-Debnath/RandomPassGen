import { Inter, Rubik_Distressed, Caveat, Amita } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const rubik_distressed = Rubik_Distressed({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-Rubik_Distressed",
  display: 'swap',
})

const amita = Amita({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-Amita",
  display: 'swap',
})

const roboto = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-Roboto",
  display: 'swap',
})

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${rubik_distressed.variable} ${amita.variable} ${roboto.variable}`}>{children}</body>
    </html>
  );
}
