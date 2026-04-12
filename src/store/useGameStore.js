import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mockLocations, buildMissionText, getLocationById, getNextLocationId } from "../data/locations";
import { sendMessage, verifyPhoto } from "../services/api";

function createUserId() {
  return `player-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function createMessage(sender, text) {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    text,
  };
}

function getInitialMission() {
  return buildMissionText(mockLocations[0].id);
}

function getInitialTargetId() {
  return mockLocations[0]?.id ?? null;
}

const initialChatMessages = [
  createMessage(
    "ai",
    "Welcome to PuzzleFinder. I will guide you through Brussels with clues, map hints, and photo checks."
  ),
];

export const useGameStore = create(
  persist(
    (set, get) => ({
      userId: createUserId(),
      theme: "dark",
      activeTab: "chat",
      currentMission: getInitialMission(),
      currentTargetId: getInitialTargetId(),
      progress: {
        completed: 0,
        total: mockLocations.length,
      },
      unlockedLocations: [],
      selectedLocationId: getInitialTargetId(),
      chatMessages: initialChatMessages,
      isChatSending: false,
      isVerifyingPhoto: false,
      userLocation: null,
      locationError: null,

      setActiveTab: (activeTab) => set({ activeTab }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      setSelectedLocationId: (selectedLocationId) => set({ selectedLocationId }),

      setCurrentTargetId: (currentTargetId) =>
        set({
          currentTargetId,
          selectedLocationId: currentTargetId,
          currentMission: currentTargetId ? buildMissionText(currentTargetId) : get().currentMission,
        }),

      requestLocation: async () => {
        if (!navigator.geolocation) {
          set({ locationError: "Geolocation is not supported on this device." });
          return null;
        }

        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const nextLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
              };

              set({ userLocation: nextLocation, locationError: null });
              resolve(nextLocation);
            },
            (error) => {
              set({ locationError: error.message });
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 15000,
            }
          );
        });
      },

      sendChatMessage: async (message) => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
          return null;
        }

        const userId = get().userId;
        const userMessage = createMessage("user", trimmedMessage);

        set((state) => ({
          chatMessages: [...state.chatMessages, userMessage],
          isChatSending: true,
        }));

        try {
          const response = await sendMessage({ userId, message: trimmedMessage });
          const replyText = response.reply || response.message || "The guide is thinking...";

          set((state) => ({
            chatMessages: [...state.chatMessages, createMessage("ai", replyText)],
            isChatSending: false,
            currentMission: response.nextMission || state.currentMission,
            currentTargetId: response.suggestedTargetId || state.currentTargetId,
            selectedLocationId: response.suggestedTargetId || state.selectedLocationId,
          }));

          return response;
        } catch (error) {
          const fallback = "I could not reach the backend, but the route is still active. Try again in a moment.";

          set((state) => ({
            chatMessages: [...state.chatMessages, createMessage("ai", fallback)],
            isChatSending: false,
          }));

          return { reply: fallback, error: error.message };
        }
      },

      submitPhotoVerification: async (photo) => {
        const currentTargetId = get().currentTargetId ?? mockLocations[0]?.id ?? null;
        const userId = get().userId;

        set({ isVerifyingPhoto: true });

        try {
          const response = await verifyPhoto({ userId, photo, locationId: currentTargetId });
          const unlockedLocation = currentTargetId ? getLocationById(currentTargetId) : null;
          const nextTargetId = response.nextTargetId ?? getNextLocationId(currentTargetId);

          set((state) => ({
            isVerifyingPhoto: false,
            progress: {
              ...state.progress,
              completed: unlockedLocation && !state.unlockedLocations.includes(unlockedLocation.id)
                ? state.progress.completed + 1
                : state.progress.completed,
            },
            unlockedLocations:
              unlockedLocation && !state.unlockedLocations.includes(unlockedLocation.id)
                ? [...state.unlockedLocations, unlockedLocation.id]
                : state.unlockedLocations,
            currentMission: response.nextChallenge || (nextTargetId ? buildMissionText(nextTargetId) : state.currentMission),
            currentTargetId: nextTargetId,
            selectedLocationId: nextTargetId || state.selectedLocationId,
          }));

          return response;
        } catch (error) {
          set({ isVerifyingPhoto: false });
          return {
            success: false,
            message: error.message,
          };
        }
      },
    }),
    {
      name: "puzzlefinder-game-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        theme: state.theme,
        activeTab: state.activeTab,
        currentMission: state.currentMission,
        currentTargetId: state.currentTargetId,
        progress: state.progress,
        unlockedLocations: state.unlockedLocations,
        selectedLocationId: state.selectedLocationId,
        chatMessages: state.chatMessages,
      }),
    }
  )
);
