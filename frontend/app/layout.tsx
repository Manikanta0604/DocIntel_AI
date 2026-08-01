import "./styles.css";
export const metadata = { title: "DocIntel AI", description: "Grounded document intelligence" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
