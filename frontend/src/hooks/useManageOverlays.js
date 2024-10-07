import { useState } from 'react';
import axios from 'axios';

const useManageOverlays = () => {
  const [overlays, setOverlays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userData');

  // Fetch Overlays
  const fetchOverlays = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/overlays?user_id=${userId}`);
      setOverlays(response.data);
      console.log('Fetched overlays:', response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching overlays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Overlay
  const createOverlay = async (newOverlay) => {
    setIsLoading(true);
    setError(null);
    console.log(newOverlay);
    const data = {
        user_id: userId,
        overlay: newOverlay
    }

    console.log(data)
    try {
      const response = await axios.post('/api/overlays', data);
      if (response.status === 201) {
        setOverlays((prevOverlays) => [...prevOverlays, response.data]);
        console.log('Overlay created:', response.data);
        fetchOverlays();
        setTimeout(() => {
            return true;
        }, 2000);
      } else {
        throw new Error('Failed to create overlay');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error creating overlay:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Overlay
  const updateOverlay = async (id, updatedData) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await axios.put(`/api/overlays/${id}`, {overlay: updatedData});
      if (response.status !== 200) {
        throw new Error('Failed to update overlay');
      }
      setOverlays((prevOverlays) =>
        prevOverlays.map((overlay) =>
          overlay._id === id ? response.data : overlay
        )
      );
      fetchOverlays();
      console.log('Overlay updated:', response.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error updating overlay:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Overlay
  const deleteOverlay = async (id) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await axios.delete(`/api/overlays/${id}`);
      if (response.status !== 200) {
        throw new Error('Failed to delete overlay');
      }
      setOverlays((prevOverlays) =>
        prevOverlays.filter((overlay) => overlay._id !== id)
      );
      console.log('Overlay deleted');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error deleting overlay:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    fetchOverlays,
    createOverlay,
    updateOverlay,
    deleteOverlay,
    setOverlays,
    overlays,
    isLoading,
    isUpdating,
    isDeleting,
    error,
  };
};

export default useManageOverlays;