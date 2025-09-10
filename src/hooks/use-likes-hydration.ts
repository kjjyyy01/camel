import { useEffect } from 'react';
import useLikesStore from '@/stores/likes-store';

export const useLikesHydration = () => {
  useEffect(() => {
    useLikesStore.persist.rehydrate();
  }, []);
};