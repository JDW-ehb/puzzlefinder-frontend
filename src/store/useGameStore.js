import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildMissionText, getLocationById, normalizeLocations } from "../data/locations";
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

function getGameStateForLocations(locations = [], currentTargetId = null) {
  const resolvedLocations = Array.isArray(locations) ? locations : [];
  const targetLocation = getLocationById(currentTargetId, resolvedLocations) || resolvedLocations[0] || null;

  return {
    currentMission: buildMissionText(targetLocation, resolvedLocations),
    currentTargetId: targetLocation?.id ?? null,
    locations: resolvedLocations,
    progress: {
      completed: 0,
      total: resolvedLocations.length,
    },
    selectedLocationId: targetLocation?.id ?? null,
  };
}

const initialChatMessages = [
  createMessage(
    "ai",
    "Welcome to PuzzleFinder. I will guide you through Brussels with clues, map hints, and photo checks."
  ),
];

function getResettableGameState() {
  const resetLocations = [];

  return {
    activeTab: "chat",
    ...getGameStateForLocations(resetLocations),
    unlockedLocations: [],
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
      ...getGameStateForLocations([]),
      unlockedLocations: [],
      chatMessages: initialChatMessages,
      isChatSending: false,
      isVerifyingPhoto: false,
      userLocation: null,
      locationError: null,
      isBootstrappingGame: false,

      initializeAuth: async () => {
        const token = get().token;
        const applyLocations = (locations, authState = {}) => {
          const resolvedLocations = Array.isArray(locations) ? locations : [];
          const targetId = authState.currentTargetId ?? authState.selectedLocationId ?? null;
          const gameState = getGameStateForLocations(resolvedLocations, targetId);

          set({
            authLoading: false,
            authInitialized: true,
            authError: null,
            locations: resolvedLocations,
            currentMission: gameState.currentMission,
            currentTargetId: gameState.currentTargetId,
            progress: {
              ...gameState.progress,
              ...(authState?.progress || {}),
              total: resolvedLocations.length,
            },
            unlockedLocations: Array.isArray(authState?.unlockedLocations) ? authState.unlockedLocations : [],
            selectedLocationId: gameState.selectedLocationId,
            chatMessages: Array.isArray(authState?.chatMessages) && authState.chatMessages.length ? authState.chatMessages : initialChatMessages,
            isAuthenticated: Boolean(token),
            isGuest: false,
            user: authState?.user ?? (token ? get().user : null),
          });
        };

        if (!token) {
          const locationsResponse = await fetchLocations();
          applyLocations(normalizeLocations(locationsResponse), {
            user: null,
            progress: {
              completed: 0,
            },
            unlockedLocations: [],
            chatMessages: initialChatMessages,
          });
          set({ isAuthenticated: false, isGuest: false, user: null });
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
          const backendGameState = stateResult.status === "fulfilled" ? stateResult.value : null;
          const locationsResponse = locationsResult.status === "fulfilled" ? locationsResult.value : null;

          if (!user) {
            throw new Error("Session expired. Please log in again.");
          }

          const backendLocations = normalizeLocations(locationsResponse);

          set((state) => {
            const locations = backendLocations.length ? backendLocations : state.locations;
            const gameState = getGameStateForLocations(locations, backendGameState?.currentTargetId ?? backendGameState?.selectedLocationId ?? null);

            return {
              authLoading: false,
              authInitialized: true,
              isAuthenticated: true,
              isGuest: false,
              user,
              authError: null,
              locations,
              currentMission: gameState.currentMission,
              currentTargetId: gameState.currentTargetId,
              progress: {
                ...(backendGameState?.progress || {}),
                completed: backendGameState?.progress?.completed ?? state.progress.completed,
                total: locations.length,
              },
              unlockedLocations: Array.isArray(backendGameState?.unlockedLocations) ? backendGameState.unlockedLocations : state.unlockedLocations,
              selectedLocationId: gameState.selectedLocationId,
              chatMessages: Array.isArray(backendGameState?.chatMessages) && backendGameState.chatMessages.length ? backendGameState.chatMessages : state.chatMessages,
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
        const guestLocations = get().locations?.length ? get().locations : [];

        set({
          ...getGameStateForLocations(guestLocations),
          activeTab: "chat",
          unlockedLocations: [],
          chatMessages: initialChatMessages,
          isChatSending: false,
          isVerifyingPhoto: false,
          userLocation: null,
          locationError: null,
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
        const resetLocations = get().locations?.length ? get().locations : [];

        set({
          ...getGameStateForLocations(resetLocations),
          activeTab: "chat",
          unlockedLocations: [],
          chatMessages: initialChatMessages,
          isChatSending: false,
          isVerifyingPhoto: false,
          userLocation: null,
          locationError: null,
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
        set((state) => ({
          currentTargetId,
          selectedLocationId: currentTargetId,
          currentMission: buildMissionText(getLocationById(currentTargetId, state.locations), state.locations),
        })),

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
                const currentTargetId = get().currentTargetId;
                const userId = get().user?.id ?? null;
                const currentStep = get().progress?.completed ?? 0;

                syncUserLocation({
                  token,
                  location: {
                    ...nextLocation,
                    currentTargetId,
                    currentStep,
                    userId,
                  },
                }).catch(() => {
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
        const currentStep = get().progress?.completed ?? 0;
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
            currentStep,
            isGuest,
          });
          const replyText = response.reply || response.message || "The guide is thinking...";
          const nextTargetId = response.suggestedTargetId ?? response.currentTargetId ?? response.currentStep ?? null;

          set((state) => ({
            chatMessages: [...state.chatMessages, createMessage("ai", replyText)],
            isChatSending: false,
            currentMission: response.nextMission || response.currentMission || state.currentMission,
            currentTargetId: nextTargetId || state.currentTargetId,
            selectedLocationId: nextTargetId || state.selectedLocationId,
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
          const isVerified = Boolean(response?.success ?? response?.verified);

          console.log("[submitPhotoVerification] Response:", response);
          console.log("[submitPhotoVerification] isVerified:", isVerified);
          console.log("[submitPhotoVerification] currentTargetId:", currentTargetId);

          set((state) => {
            if (!isVerified) {
              console.log("[submitPhotoVerification] Verification failed, not advancing");
              return {
                isVerifyingPhoto: false,
              };
            }

            const currentId = currentTargetId != null ? String(currentTargetId) : null;
            const currentIndex = currentId
              ? state.locations.findIndex((location) => String(location.id) === currentId)
              : -1;
            const nextTargetId =
              response.nextTargetId ??
              state.locations[currentIndex + 1]?.id ??
              state.currentTargetId;
            const nextLocation = getLocationById(nextTargetId, state.locations);
            const nextMission =
              response.nextChallenge ||
              response.nextMission ||
              buildMissionText(nextLocation, state.locations) ||
              state.currentMission;

            const isNewLocation = currentId && !state.unlockedLocations.includes(currentId);

            console.log("[submitPhotoVerification] isNewLocation:", isNewLocation);
            console.log("[submitPhotoVerification] currentId:", currentId);
            console.log("[submitPhotoVerification] unlockedLocations before:", state.unlockedLocations);
            console.log("[submitPhotoVerification] nextTargetId:", nextTargetId);
            console.log("[submitPhotoVerification] nextMission:", nextMission);

            return {
              isVerifyingPhoto: false,
              progress: {
                ...state.progress,
                completed: isNewLocation ? state.progress.completed + 1 : state.progress.completed,
              },
              unlockedLocations: isNewLocation ? [...state.unlockedLocations, currentId] : state.unlockedLocations,
              currentMission: nextMission,
              currentTargetId: nextTargetId,
              selectedLocationId: nextTargetId || state.selectedLocationId,
            };
          });

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
