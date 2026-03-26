import { lazy, Suspense, useEffect, useState } from "react";

import { LandingPage } from "./pages/LandingPage";

const SpectrePage = lazy(() =>
  import("./pages/SpectrePage").then((m) => ({ default: m.SpectrePage }))
);

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
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-spectre-bg font-mono text-sm text-spectre-muted">
            Loading Spectre Finance…
          </div>
        }
      >
        <SpectrePage />
      </Suspense>
    );
  }

  return <LandingPage onLaunchApp={handleLaunchApp} />;
}

export default App;
