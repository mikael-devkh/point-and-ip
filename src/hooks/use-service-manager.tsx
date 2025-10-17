import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type RequiredMediaType =
  | "serial"
  | "defect_photo"
  | "solution_video"
  | "workbench_photo"
  | "replacement_serial";

export type MediaStatus = "missing" | "uploaded";

export interface ActiveCall {
  id: string;
  fsa: string;
  codigoLoja: string;
  pdv?: string;
  status: "open" | "completed" | "archived";
  photos: Record<RequiredMediaType, MediaStatus>;
  openedAt: string;
  timeStarted: number | null;
  timeTotalServiceMinutes: number;
}

interface NewCallPayload {
  id?: string;
  fsa: string;
  codigoLoja: string;
  pdv?: string;
}

export interface GroupedCallBucket {
  date: string;
  stores: {
    codigoLoja: string;
    calls: ActiveCall[];
  }[];
}

interface ServiceManagerContextValue {
  calls: ActiveCall[];
  activeCalls: ActiveCall[];
  addCall: (payload: NewCallPayload) => void;
  removeCall: (id: string) => void;
  updatePhotoStatus: (
    id: string,
    media: RequiredMediaType,
    status: MediaStatus
  ) => void;
  completeCall: (id: string) => void;
  archiveAllCompleted: () => void;
  startCallTimer: (id: string, startedAt?: number) => void;
  stopCallTimer: (id: string, additionalMinutes: number) => void;
  resetCallTimer: (id: string) => void;
}

const LOCAL_STORAGE_KEY = "service_manager_calls";

const ServiceManagerContext =
  createContext<ServiceManagerContextValue | undefined>(undefined);

const defaultMediaState: Record<RequiredMediaType, MediaStatus> = {
  serial: "missing",
  defect_photo: "missing",
  solution_video: "missing",
  workbench_photo: "missing",
  replacement_serial: "missing",
};

const ensureMediaState = (
  photos?: Partial<Record<RequiredMediaType, MediaStatus>>
): Record<RequiredMediaType, MediaStatus> => {
  return {
    ...defaultMediaState,
    ...(photos ?? {}),
  };
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `call-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeCall = (raw: ActiveCall): ActiveCall => {
  const openedAt = raw.openedAt ?? new Date().toISOString();
  return {
    ...raw,
    openedAt,
    photos: ensureMediaState(raw.photos),
    timeStarted: raw.timeStarted ?? null,
    timeTotalServiceMinutes: raw.timeTotalServiceMinutes ?? 0,
  };
};

const loadStoredCalls = (): ActiveCall[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ActiveCall[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCall);
  } catch (error) {
    console.error("Erro ao carregar chamados do Local Storage", error);
    return [];
  }
};

export const getGroupedCalls = (calls: ActiveCall[]): GroupedCallBucket[] => {
  const accumulator = new Map<string, Map<string, ActiveCall[]>>();

  calls.forEach((call) => {
    const referenceTime = call.timeStarted ?? Date.parse(call.openedAt);
    const dateKey = Number.isFinite(referenceTime)
      ? new Date(referenceTime).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    if (!accumulator.has(dateKey)) {
      accumulator.set(dateKey, new Map());
    }
    const storeMap = accumulator.get(dateKey)!;
    if (!storeMap.has(call.codigoLoja)) {
      storeMap.set(call.codigoLoja, []);
    }
    storeMap.get(call.codigoLoja)!.push(call);
  });

  const sortedDates = Array.from(accumulator.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  return sortedDates.map(([date, storeMap]) => {
    const stores = Array.from(storeMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([codigoLoja, storeCalls]) => ({
        codigoLoja,
        calls: [...storeCalls].sort((a, b) => a.fsa.localeCompare(b.fsa)),
      }));

    return {
      date,
      stores,
    };
  });
};

export const ServiceManagerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [calls, setCalls] = useState<ActiveCall[]>(() => loadStoredCalls());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(calls.map(normalizeCall))
      );
    } catch (error) {
      console.error("Erro ao salvar chamados no Local Storage", error);
    }
  }, [calls]);

  const addCall = useCallback((payload: NewCallPayload) => {
    setCalls((prev) => {
      const id = payload.id ?? createId();
      if (prev.some((call) => call.id === id)) {
        return prev;
      }

      const newCall: ActiveCall = {
        id,
        fsa: payload.fsa,
        codigoLoja: payload.codigoLoja,
        pdv: payload.pdv,
        status: "open",
        photos: ensureMediaState(),
        openedAt: new Date().toISOString(),
        timeStarted: null,
        timeTotalServiceMinutes: 0,
      };

      return [newCall, ...prev];
    });
  }, []);

  const removeCall = useCallback((id: string) => {
    setCalls((prev) => prev.filter((call) => call.id !== id));
  }, []);

  const updatePhotoStatus = useCallback(
    (id: string, media: RequiredMediaType, status: MediaStatus) => {
      setCalls((prev) =>
        prev.map((call) =>
          call.id === id
            ? {
                ...call,
                photos: {
                  ...call.photos,
                  [media]: status,
                },
              }
            : call
        )
      );
    },
    []
  );

  const completeCall = useCallback((id: string) => {
    setCalls((prev) =>
      prev.map((call) => {
        if (call.id !== id) return call;
        let additionalMinutes = 0;
        if (call.timeStarted) {
          additionalMinutes = Math.max(
            0,
            Math.round((Date.now() - call.timeStarted) / 60000)
          );
        }
        return {
          ...call,
          status: "completed",
          timeStarted: null,
          timeTotalServiceMinutes:
            call.timeTotalServiceMinutes + additionalMinutes,
        };
      })
    );
  }, []);

  const archiveAllCompleted = useCallback(() => {
    setCalls((prev) =>
      prev.map((call) =>
        call.status === "completed"
          ? {
              ...call,
              status: "archived",
              timeStarted: null,
            }
          : call
      )
    );
  }, []);

  const startCallTimer = useCallback((id: string, startedAt?: number) => {
    const startTimestamp = startedAt ?? Date.now();
    setCalls((prev) =>
      prev.map((call) => {
        if (call.id === id) {
          return {
            ...call,
            timeStarted: startTimestamp,
          };
        }

        if (call.timeStarted !== null) {
          return {
            ...call,
            timeStarted: null,
          };
        }

        return call;
      })
    );
  }, []);

  const stopCallTimer = useCallback((id: string, additionalMinutes: number) => {
    setCalls((prev) =>
      prev.map((call) =>
        call.id === id
          ? {
              ...call,
              timeStarted: null,
              timeTotalServiceMinutes:
                call.timeTotalServiceMinutes + Math.max(0, additionalMinutes),
            }
          : call
      )
    );
  }, []);

  const resetCallTimer = useCallback((id: string) => {
    setCalls((prev) =>
      prev.map((call) =>
        call.id === id
          ? {
              ...call,
              timeStarted: null,
              timeTotalServiceMinutes: 0,
            }
          : call
      )
    );
  }, []);

  const value = useMemo<ServiceManagerContextValue>(() => {
    const activeCalls = calls.filter((call) => call.status !== "archived");
    return {
      calls,
      activeCalls,
      addCall,
      removeCall,
      updatePhotoStatus,
      completeCall,
      archiveAllCompleted,
      startCallTimer,
      stopCallTimer,
      resetCallTimer,
    };
  }, [
    calls,
    addCall,
    removeCall,
    updatePhotoStatus,
    completeCall,
    archiveAllCompleted,
    startCallTimer,
    stopCallTimer,
    resetCallTimer,
  ]);

  return (
    <ServiceManagerContext.Provider value={value}>
      {children}
    </ServiceManagerContext.Provider>
  );
};

export const useServiceManager = () => {
  const context = useContext(ServiceManagerContext);
  if (!context) {
    throw new Error(
      "useServiceManager deve ser usado dentro de um ServiceManagerProvider"
    );
  }
  return context;
};
