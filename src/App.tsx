import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AppProvider } from './context/AppContext';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';

function App() {
  return (
    <Router>
      <AppProvider>
        <Layout>
          <Dashboard />
          <TutorialOverlay />
        </Layout>
      </AppProvider>
    </Router>
  );
}

export default App;