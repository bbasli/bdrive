import SideNavigation from "./side-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full pt-12">
      <div className="flex h-full">
        <SideNavigation />

        <div className="w-full mx-8">{children}</div>
      </div>
    </main>
  );
}
