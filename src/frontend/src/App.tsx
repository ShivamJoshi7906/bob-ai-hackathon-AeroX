import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';

import { FleetDashboard } from './pages/FleetDashboard';
import { AssetDetails } from './pages/AssetDetails';
import { SensorAnalytics } from './pages/SensorAnalytics';
import { MaintenanceCenter } from './pages/MaintenanceCenter';
import { MissionWindows } from './pages/MissionWindows';
import { BobCopilot } from './pages/BobCopilot';

import { FleetSummary, AssetRow } from './types/asset';
import { api } from './api/client';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('fleet');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('AC-003');
  const [bobInitialQuery, setBobInitialQuery] = useState<string | undefined>(undefined);

  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [assets, setAssets] = useState<AssetRow[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, assetRes] = await Promise.all([
          api.getFleetSummary(),
          api.getAssets(),
        ]);
        setSummary(sumRes);
        setAssets(assetRes);
      } catch (err) {
        console.error('Error loading initial fleet data:', err);
      }
    }
    loadData();
  }, []);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentPage('asset');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToSensors = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentPage('sensors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToBob = (query?: string, assetId?: string) => {
    if (assetId) setSelectedAssetId(assetId);
    setBobInitialQuery(query);
    setCurrentPage('bob');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        summary={summary}
        onNavigateToBob={() => handleNavigateToBob('Which assets are not ready?')}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onPageChange={page => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedAssetId={selectedAssetId}
          criticalCount={summary?.urgent_maintenance_p1 || 3}
        />

        {/* Page Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentPage === 'fleet' && (
            <FleetDashboard
              summary={summary}
              assets={assets}
              onSelectAsset={handleSelectAsset}
              onNavigateToMaintenance={() => setCurrentPage('maintenance')}
              onNavigateToBob={handleNavigateToBob}
            />
          )}

          {currentPage === 'asset' && (
            <AssetDetails
              assetId={selectedAssetId}
              onBack={() => setCurrentPage('fleet')}
              onNavigateToSensors={handleNavigateToSensors}
              onNavigateToBob={handleNavigateToBob}
            />
          )}

          {currentPage === 'sensors' && (
            <SensorAnalytics
              initialAssetId={selectedAssetId}
              onSelectAsset={setSelectedAssetId}
            />
          )}

          {currentPage === 'maintenance' && (
            <MaintenanceCenter onSelectAsset={handleSelectAsset} />
          )}

          {currentPage === 'missions' && (
            <MissionWindows
              onSelectAsset={handleSelectAsset}
              onNavigateToBob={handleNavigateToBob}
            />
          )}

          {currentPage === 'bob' && (
            <BobCopilot
              initialQuery={bobInitialQuery}
              initialAssetId={selectedAssetId}
              onSelectAsset={handleSelectAsset}
            />
          )}
        </main>
      </div>

    </div>
  );
}

export default App;
