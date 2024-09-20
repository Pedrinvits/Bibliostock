import LibraryInventorySystem from "@/components/library-inventory";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <main>
      <ModeToggle/>
      <LibraryInventorySystem />
    </main>
  );
}
