import { useEffect, useState } from "react";

import { LandingPage } from "./pages/LandingPage";
import { SpectrePage } from "./pages/SpectrePage";

type AppView = "landing" | "app";

const APP_HASH = "#/app";

function getViewFromLocation(): AppView {
  return window.location.hash === APP_HASH ? "app" : "landing";
}

function App() {
  const [view, setView] = useState<AppView>(() => getViewFromLocation());

  useEffect(() => {
    const handleHashChange = () => {
      setView(getViewFromLocation());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLaunchApp = () => {
    window.location.hash = APP_HASH;
  };

  if (view === "app") {
    return <SpectrePage />;
  }

  return <LandingPage onLaunchApp={handleLaunchApp} />;
}

export default App;
