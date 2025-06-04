import React from 'react';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AppProvider } from './context/AppContext';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Dashboard />
        <TutorialOverlay />
      </Layout>
    </AppProvider>
  );
}

export default App;