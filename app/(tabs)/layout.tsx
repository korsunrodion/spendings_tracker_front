import BottomNav from "@/components/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh">
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
