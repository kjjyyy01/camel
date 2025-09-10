import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LikedProperty {
  id: string;
  name: string;
  address: string;
  price: number;
  type: string;
  area: number;
  imageUrl?: string;
}

interface LikesStore {
  likedProperties: Map<string, LikedProperty>;
  isLiked: (propertyId: string) => boolean;
  toggleLike: (property: LikedProperty) => void;
  getLikedCount: () => number;
  getLikedProperties: () => LikedProperty[];
  clearAllLikes: () => void;
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

const useLikesStore = create<LikesStore>()(
  persist(
    (set, get) => ({
      likedProperties: new Map(),
      isHydrated: false,

      isLiked: (propertyId: string) => {
        return get().likedProperties.has(propertyId);
      },

      toggleLike: (property: LikedProperty) => {
        set((state) => {
          const newLikedProperties = new Map(state.likedProperties);
          
          if (newLikedProperties.has(property.id)) {
            newLikedProperties.delete(property.id);
          } else {
            newLikedProperties.set(property.id, property);
          }
          
          return { likedProperties: newLikedProperties };
        });
      },

      getLikedCount: () => {
        return get().likedProperties.size;
      },

      getLikedProperties: () => {
        return Array.from(get().likedProperties.values());
      },

      clearAllLikes: () => {
        set({ likedProperties: new Map() });
      },

      setHydrated: (state: boolean) => {
        set({ isHydrated: state });
      },
    }),
    {
      name: 'likes-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === 'likedProperties') {
            return new Map(value as Array<[string, LikedProperty]>);
          }
          return value;
        },
        replacer: (key, value) => {
          if (key === 'likedProperties') {
            return Array.from((value as Map<string, LikedProperty>).entries());
          }
          return value;
        },
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      skipHydration: true,
    }
  )
);

export default useLikesStore;