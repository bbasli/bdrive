import SideNavigation from "./side-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container mx-auto pt-12 px-0">
      <div className="flex h-full">
        <SideNavigation />

        <div className="w-full mx-8">{children}</div>
      </div>
    </main>
  );
}
