import LibraryInventorySystem from "@/components/library-inventory";
import Loading from "@/components/loader";
import { ModeToggle } from "@/components/mode-toggle";
import { Suspense } from 'react';

export default function Home() {
  return (
    <main>
      <ModeToggle/>
      <Suspense fallback={<Loading />}>
        <LibraryInventorySystem />
      </Suspense>
    </main>
  );
}
