import { PrepProvider, usePrep } from "./context/PrepContext.jsx";
import Background from "./components/Background.jsx";
import SetupOverlay from "./components/SetupOverlay.jsx";
import TopBar from "./components/TopBar.jsx";
import Dock from "./components/Dock.jsx";
import MoreSheet from "./components/MoreSheet.jsx";
import HomeTab from "./components/tabs/HomeTab.jsx";
import FocusTab from "./components/tabs/FocusTab.jsx";
import TodayTab from "./components/tabs/TodayTab.jsx";
import WeekTab from "./components/tabs/WeekTab.jsx";
import TopicsTab from "./components/tabs/TopicsTab.jsx";
import QuizTab from "./components/tabs/QuizTab.jsx";
import ResourcesTab from "./components/tabs/ResourcesTab.jsx";
import DuelTab from "./components/tabs/DuelTab.jsx";
import BacklogTab from "./components/tabs/BacklogTab.jsx";
import SettingsTab from "./components/tabs/SettingsTab.jsx";
import Toast from "./components/Toast.jsx";
import Confetti from "./components/Confetti.jsx";

function AppShell() {
  const { activeTab, appRef, toast, confettiBurst } = usePrep();

  return (
    <>
      <Background />
      <div className="shell">
        <SetupOverlay />
        <TopBar />
        <main id="app" ref={appRef}>
          <HomeTab active={activeTab === "home"} />
          <FocusTab active={activeTab === "focus"} />
          <TodayTab active={activeTab === "today"} />
          <WeekTab active={activeTab === "week"} />
          <TopicsTab active={activeTab === "topics"} />
          <QuizTab active={activeTab === "quiz"} />
          <ResourcesTab active={activeTab === "resources"} />
          <DuelTab active={activeTab === "duel"} />
          <BacklogTab active={activeTab === "backlog"} />
          <SettingsTab active={activeTab === "settings"} />
        </main>
        <footer className="footer">PrepDuel</footer>
      </div>
      <Dock />
      <MoreSheet />
      <Toast toast={toast} />
      <Confetti burst={confettiBurst} />
    </>
  );
}

export default function App() {
  return (
    <PrepProvider>
      <AppShell />
    </PrepProvider>
  );
}
