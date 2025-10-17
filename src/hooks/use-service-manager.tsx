import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
  createdAt: string;
}

interface ServiceManagerContextValue {
  calls: ActiveCall[];
  activeCalls: ActiveCall[];
  addCall: (payload: NewCallPayload) => void;
  removeCall: (id: string) => void;
  updatePhotoStatus: (id: string, media: RequiredMediaType, status: MediaStatus) => void;
  completeCall: (id: string) => void;
  resetCallMedia: (id: string) => void;
}

interface NewCallPayload {
  id?: string;
  fsa: string;
  codigoLoja: string;
  pdv?: string;
}

const LOCAL_STORAGE_KEY = "service_manager_calls";

const ServiceManagerContext = createContext<ServiceManagerContextValue | undefined>(undefined);

const defaultMediaState: Record<RequiredMediaType, MediaStatus> = {
  serial: "missing",
  defect_photo: "missing",
  solution_video: "missing",
  workbench_photo: "missing",
  replacement_serial: "missing",
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `call-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function loadStoredCalls(): ActiveCall[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActiveCall[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error("Erro ao carregar chamados do Local Storage", error);
    return [];
  }
}

export const ServiceManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const [calls, setCalls] = useState<ActiveCall[]>(() => loadStoredCalls());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(calls));
    } catch (error) {
      console.error("Erro ao salvar chamados no Local Storage", error);
    }
  }, [calls]);

  const addCall = (payload: NewCallPayload) => {
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
        photos: { ...defaultMediaState },
        createdAt: new Date().toISOString(),
      };

      return [newCall, ...prev];
    });
  };

  const removeCall = (id: string) => {
    setCalls((prev) => prev.filter((call) => call.id !== id));
  };

  const updatePhotoStatus = (id: string, media: RequiredMediaType, status: MediaStatus) => {
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
  };

  const resetCallMedia = (id: string) => {
    setCalls((prev) =>
      prev.map((call) =>
        call.id === id
          ? {
              ...call,
              photos: { ...defaultMediaState },
            }
          : call
      )
    );
  };

  const completeCall = (id: string) => {
    setCalls((prev) =>
      prev.map((call) =>
        call.id === id
          ? {
              ...call,
              status: "completed",
            }
          : call
      )
    );
  };

  const value = useMemo<ServiceManagerContextValue>(() => {
    const activeCalls = calls.filter((call) => call.status !== "archived");

    return {
      calls,
      activeCalls,
      addCall,
      removeCall,
      updatePhotoStatus,
      completeCall,
      resetCallMedia,
    };
  }, [calls]);

  return <ServiceManagerContext.Provider value={value}>{children}</ServiceManagerContext.Provider>;
};

export const useServiceManager = () => {
  const context = useContext(ServiceManagerContext);
  if (!context) {
    throw new Error("useServiceManager deve ser usado dentro de um ServiceManagerProvider");
  }
  return context;
};
