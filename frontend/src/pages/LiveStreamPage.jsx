import React, { useState, useEffect } from 'react';
import useManageOverlays from '../hooks/useManageOverlays';
import LiveStreamPlayer from '../components/LiveStreamPlayer';

const LiveStreamPage = () => {
  const { fetchOverlays, overlays } = useManageOverlays();

  useEffect(() => {
    fetchOverlays();
  }, []);

  return (
    <div className='mt-12 max-w-4xl mx-auto'>
      <h2 className="text-2xl font-bold mb-4">Livestream</h2>
      <LiveStreamPlayer overlays={overlays} />
    </div>
  );
};

export default LiveStreamPage;