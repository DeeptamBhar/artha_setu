import React from 'react';
import DiscoveryHub from './DiscoveryHub';
import CockpitPanel from '../components/CockpitPanel';

export default function ClientsDashboard({ setActiveTab }) {
  return (
    <>
      <section className="w-[40%] flex flex-col bg-surface-container-lowest border-r border-outline-variant/15 overflow-hidden relative">
        <DiscoveryHub />
      </section>
      <section className="w-[60%] bg-surface flex flex-col overflow-y-auto no-scrollbar relative">
        <CockpitPanel setActiveTab={setActiveTab} />
      </section>
    </>
  );
}
