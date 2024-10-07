import React, { useState, useEffect, useRef } from 'react';
import LiveStreamPlayer from '../components/LiveStreamPlayer';
import useManageOverlays from '../hooks/useManageOverlays';
import { useNavigate } from 'react-router-dom';

const OverlaySettingsPage = () => {
  const [newOverlay, setNewOverlay] = useState({
    content: '',
    position: { x: 50, y: 50 },
    size: { width: 20, height: 10 },
    type: 'text'
  });
  const [editingOverlay, setEditingOverlay] = useState(null);
  const videoContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const { overlays, setOverlays, fetchOverlays, deleteOverlay, updateOverlay, createOverlay } = useManageOverlays();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!localStorage.getItem('userData')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchOverlays();
  }, []);

  

  const handleCreateOverlay = () => {
    if (newOverlay.type === 'text' && newOverlay.content.trim() === '') return;
    if (newOverlay.type === 'image' && !newOverlay.content) return;
    setOverlays([...overlays, { ...newOverlay }]);
    createOverlay(newOverlay);
    setNewOverlay({ content: '', position: { x: 50, y: 50 }, size: { width: 20, height: 10 }, type: 'text' });
  };

  const handleDeleteOverlay = (id) => {
    setOverlays(overlays.filter(overlay => overlay._id !== id));
    deleteOverlay(id);
    if (editingOverlay && editingOverlay._id === id) {
      setEditingOverlay(null);
    }
  };

  const handleOverlayDrag = (e, overlay) => {
    if (!videoContainerRef.current) return;

    const rect = videoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const updatedOverlay = {
      ...overlay,
      position: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      }
    };

    setOverlays(overlays.map(o => o._id === overlay._id ? updatedOverlay : o));
    setEditingOverlay(updatedOverlay);
  };

  const handleEditOverlay = (overlay) => {
    setEditingOverlay(overlay);
  };

  const handleUpdateOverlay = () => {
    if (editingOverlay) {
      setOverlays(overlays.map(o => o._id === editingOverlay._id ? editingOverlay : o));
      updateOverlay(editingOverlay._id, editingOverlay);
      setEditingOverlay(null);
    }
  };

  const handleFileChange = (e, isNewOverlay = true) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isNewOverlay) {
          setNewOverlay({ ...newOverlay, content: reader.result });
        } else {
          setEditingOverlay({ ...editingOverlay, content: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-white mb-6">Overlay Settings</h2>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3" ref={videoContainerRef}>
            <LiveStreamPlayer
              overlays={overlays}
              onOverlaySelect={handleEditOverlay}
              onOverlayDrag={handleOverlayDrag}
              selectedOverlay={editingOverlay}
            />
          </div>
          <div className="lg:w-1/3 bg-gray-800 shadow-xl rounded-lg p-6">
            {!editingOverlay && (
              <div className="mb-4">
                <h3 className="text-xl font-bold text-green-400 mb-4">Create New Overlay</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300">Type</label>
                  <select
                    value={newOverlay.type}
                    onChange={(e) => setNewOverlay({ ...newOverlay, type: e.target.value, content: '' })}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                {newOverlay.type === 'text' ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={newOverlay.content}
                      onChange={(e) => setNewOverlay({ ...newOverlay, content: e.target.value })}
                      placeholder="Overlay Content"
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e)}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">X Position (%)</label>
                    <input
                      type="number"
                      value={newOverlay.position.x}
                      onChange={(e) => setNewOverlay({ ...newOverlay, position: { ...newOverlay.position, x: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Y Position (%)</label>
                    <input
                      type="number"
                      value={newOverlay.position.y}
                      onChange={(e) => setNewOverlay({ ...newOverlay, position: { ...newOverlay.position, y: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Width (%)</label>
                    <input
                      type="number"
                      value={newOverlay.size.width}
                      onChange={(e) => setNewOverlay({ ...newOverlay, size: { ...newOverlay.size, width: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Height (%)</label>
                    <input
                      type="number"
                      value={newOverlay.size.height}
                      onChange={(e) => setNewOverlay({ ...newOverlay, size: { ...newOverlay.size, height: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateOverlay}
                  className="w-full bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Create Overlay
                </button>
              </div>
            )}
            {editingOverlay && (
              <div className="mb-4">
                <h3 className="text-xl font-bold text-red-400 mb-4">Edit Selected Overlay</h3>
                <p className="text-sm text-gray-400 mb-2">Drag and drop the overlay to change its position.</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300">Type</label>
                  <select
                    value={editingOverlay.type}
                    onChange={(e) => setEditingOverlay({ ...editingOverlay, type: e.target.value, content: '' })}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                {editingOverlay.type === 'text' ? (
                  <input
                    type="text"
                    value={editingOverlay.content}
                    onChange={(e) => setEditingOverlay({ ...editingOverlay, content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />
                ) : (
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, false)}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">X Position (%)</label>
                    <input
                      type="number"
                      value={editingOverlay.position.x}
                      onChange={(e) => setEditingOverlay({ ...editingOverlay, position: { ...editingOverlay.position, x: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Y Position (%)</label>
                    <input
                      type="number"
                      value={editingOverlay.position.y}
                      onChange={(e) => setEditingOverlay({ ...editingOverlay, position: { ...editingOverlay.position, y: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Width (%)</label>
                    <input
                      type="number"
                      value={editingOverlay.size.width}
                      onChange={(e) => setEditingOverlay({ ...editingOverlay, size: { ...editingOverlay.size, width: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Height (%)</label>
                    <input
                      type="number"
                      value={editingOverlay.size.height}
                      onChange={(e) => setEditingOverlay({ ...editingOverlay, size: { ...editingOverlay.size, height: parseInt(e.target.value) } })}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateOverlay}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingOverlay(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Existing Overlays</h3>
              <ul className="space-y-2">
                {overlays && overlays.map(overlay => (
                  <li key={overlay._id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                    <div className="flex-grow overflow-hidden mr-4">
                      {overlay.type === 'text' ? (
                        <div className="flex items-center">
                          <span className="text-white truncate max-w-xs">{overlay.content}</span>
                          <span className="text-gray-400 ml-2">(text)</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <img src={overlay.content} alt="Overlay" className="w-10 h-10 object-cover rounded mr-2" />
                          <span className="text-white">(image)</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-400 mt-1">
                        Size: {overlay.size && `${overlay.size.width}% x ${overlay.size.height}%`}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleEditOverlay(overlay)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOverlay(overlay._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlaySettingsPage;