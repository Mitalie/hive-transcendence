import NavBar from "./components/NavBar";
import "./globals.css";

export const metadata = {
  title: "Transcendence",
  description: "42 ft_transcendence project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}