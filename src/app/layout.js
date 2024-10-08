import { Inter, Rubik_Distressed, Caveat, Amita } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";

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

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-Caveat",
  display: 'swap',
})


export const metadata = {
  title: "Password Generator",
  description: "A simple secure strong password generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${inter.className} ${rubik_distressed.variable} ${amita.variable} ${caveat.variable}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
