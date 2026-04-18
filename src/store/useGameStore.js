import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildMissionText, mockLocations } from "../data/locations";
import {
  fetchGameState,
  fetchLocations,
  fetchSession,
  loginUser,
  registerUser,
  sendMessage,
  syncProgress,
  syncUserLocation,
  verifyPhoto,
} from "../services/api";

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

function getResettableGameState() {
  return {
    activeTab: "chat",
    currentMission: getInitialMission(),
    currentTargetId: getInitialTargetId(),
    locations: mockLocations,
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
  };
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isGuest: false,
      isAuthenticated: false,
      authLoading: false,
      authInitialized: false,
      authError: null,
      theme: "dark",
      activeTab: "chat",
      currentMission: getInitialMission(),
      currentTargetId: getInitialTargetId(),
      locations: mockLocations,
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
      isBootstrappingGame: false,

      initializeAuth: async () => {
        const token = get().token;

        if (!token) {
          set({ authInitialized: true, isAuthenticated: false, user: null, isGuest: false });
          return;
        }

        set({ authLoading: true, authError: null });

        try {
          const [sessionResult, stateResult, locationsResult] = await Promise.allSettled([
            fetchSession(token),
            fetchGameState(token),
            fetchLocations(token),
          ]);

          const user = sessionResult.status === "fulfilled" ? sessionResult.value.user || sessionResult.value : null;
          const gameState = stateResult.status === "fulfilled" ? stateResult.value : null;
          const locationsResponse = locationsResult.status === "fulfilled" ? locationsResult.value : null;

          if (!user) {
            throw new Error("Session expired. Please log in again.");
          }

          const backendLocations = locationsResponse?.locations || locationsResponse;

          set((state) => {
            const locations = Array.isArray(backendLocations) && backendLocations.length ? backendLocations : state.locations;

            return {
              authLoading: false,
              authInitialized: true,
              isAuthenticated: true,
              isGuest: false,
              user,
              authError: null,
              locations,
              currentMission: gameState?.currentMission || state.currentMission,
              currentTargetId: gameState?.currentTargetId || state.currentTargetId,
              progress: gameState?.progress || {
                ...state.progress,
                total: locations.length,
              },
              unlockedLocations: gameState?.unlockedLocations || state.unlockedLocations,
              selectedLocationId: gameState?.selectedLocationId || state.selectedLocationId || state.currentTargetId,
              chatMessages: Array.isArray(gameState?.chatMessages) && gameState.chatMessages.length ? gameState.chatMessages : state.chatMessages,
            };
          });
        } catch (error) {
          set({
            token: null,
            user: null,
            isGuest: false,
            isAuthenticated: false,
            authLoading: false,
            authInitialized: true,
            authError: error.message,
          });
        }
      },

      login: async ({ email, password }) => {
        set({ authLoading: true, authError: null });

        try {
          const loginResponse = await loginUser({ email, password });
          const token = loginResponse?.token || loginResponse?.accessToken;

          if (!token) {
            throw new Error("Login response did not include an access token.");
          }

          set({ token, isAuthenticated: true, isGuest: false });

          await get().initializeAuth();

          return { success: true };
        } catch (error) {
          set({
            token: null,
            user: null,
            isGuest: false,
            isAuthenticated: false,
            authLoading: false,
            authInitialized: true,
            authError: error.message,
          });

          return { success: false, message: error.message };
        }
      },

      register: async ({ name, email, password }) => {
        set({ authLoading: true, authError: null });

        try {
          const registerResponse = await registerUser({ name, email, password });
          const token = registerResponse?.token || registerResponse?.accessToken;

          if (!token) {
            throw new Error("Join response did not include an access token.");
          }

          set({ token, isAuthenticated: true, isGuest: false });

          await get().initializeAuth();

          return { success: true };
        } catch (error) {
          set({
            token: null,
            user: null,
            isGuest: false,
            isAuthenticated: false,
            authLoading: false,
            authInitialized: true,
            authError: error.message,
          });

          return { success: false, message: error.message };
        }
      },

      signInAsGuest: () => {
        set({
          ...getResettableGameState(),
          token: null,
          user: {
            id: "guest",
            name: "Guest Explorer",
            email: null,
          },
          isGuest: true,
          isAuthenticated: true,
          authLoading: false,
          authInitialized: true,
          authError: null,
        });
      },

      logout: () => {
        set({
          ...getResettableGameState(),
          token: null,
          user: null,
          isGuest: false,
          isAuthenticated: false,
          authError: null,
          authLoading: false,
          authInitialized: true,
        });
      },

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

              const token = get().token;
              if (token) {
                syncUserLocation({ token, location: nextLocation }).catch(() => {
                  set({ locationError: "Location shared, but backend location sync failed." });
                });
              }

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

        const token = get().token;
        const currentMission = get().currentMission;
        const currentTargetId = get().currentTargetId;
        const isGuest = get().isGuest;
        const userMessage = createMessage("user", trimmedMessage);

        set((state) => ({
          chatMessages: [...state.chatMessages, userMessage],
          isChatSending: true,
        }));

        try {
          const response = await sendMessage({
            token,
            message: trimmedMessage,
            currentMission,
            currentTargetId,
            isGuest,
          });
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
          const fallback =
            error.message === "Request timed out"
              ? "Error: AI is down right now. Please try again in a few seconds."
              : "Error: Could not reach the AI backend.";

          set((state) => ({
            chatMessages: [...state.chatMessages, createMessage("ai", fallback)],
            isChatSending: false,
          }));

          return { reply: fallback, error: error.message };
        }
      },

      submitPhotoVerification: async (photo) => {
        const currentTargetId = get().currentTargetId ?? get().locations[0]?.id ?? null;
        const token = get().token;

        set({ isVerifyingPhoto: true });

        try {
          const response = await verifyPhoto({ token, photo, locationId: currentTargetId });
          const nextTargetId = response.nextTargetId ?? null;

          set((state) => ({
            isVerifyingPhoto: false,
            progress: {
              ...state.progress,
              completed: currentTargetId && !state.unlockedLocations.includes(currentTargetId)
                ? state.progress.completed + 1
                : state.progress.completed,
            },
            unlockedLocations:
              currentTargetId && !state.unlockedLocations.includes(currentTargetId)
                ? [...state.unlockedLocations, currentTargetId]
                : state.unlockedLocations,
            currentMission: response.nextChallenge || response.nextMission || state.currentMission,
            currentTargetId: nextTargetId,
            selectedLocationId: nextTargetId || state.selectedLocationId,
          }));

          const snapshot = get();
          if (token) {
            syncProgress({
              token,
              progress: snapshot.progress,
              unlockedLocations: snapshot.unlockedLocations,
            }).catch(() => {
              // No-op: local state remains updated even if sync fails.
            });
          }

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
      partialize: (state) =>
        state.isGuest
          ? {
              theme: state.theme,
            }
          : {
              token: state.token,
              user: state.user,
              isGuest: state.isGuest,
              isAuthenticated: state.isAuthenticated,
              theme: state.theme,
              activeTab: state.activeTab,
              currentMission: state.currentMission,
              currentTargetId: state.currentTargetId,
              locations: state.locations,
              progress: state.progress,
              unlockedLocations: state.unlockedLocations,
              selectedLocationId: state.selectedLocationId,
              chatMessages: state.chatMessages,
            },
    }
  )
);
