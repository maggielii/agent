import { BottomBar } from "./components/layout/BottomBar";
import { CommandBar } from "./components/layout/CommandBar";
import { LeftRail } from "./components/layout/LeftRail";
import { MainWorkspace } from "./components/layout/MainWorkspace";
import { RightRail } from "./components/layout/RightRail";

export default function App() {
  return (
    <div className="grid h-screen grid-cols-[240px_1fr_288px] grid-rows-[48px_1fr_auto] overflow-hidden bg-court-base text-zinc-50">
      <CommandBar />
      <LeftRail />
      <MainWorkspace />
      <RightRail />
      <BottomBar />
    </div>
  );
}
