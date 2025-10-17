import { Procedure, ChecklistStep, mockProcedures, mockTroubleshootingFlow } from "@/data/troubleshootingData";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY_PROCEDURES = "kb_procedures_data";
const LOCAL_STORAGE_KEY_CHECKLIST = "kb_checklist_data";

interface EditableData {
  procedures: Procedure[];
  flow: ChecklistStep[];
}

// Helper para fazer parse de JSON com segurança e tratamento de erro
function safeParseJson<T>(jsonString: string | null, fallbackData: T): T {
  if (!jsonString) {
    return fallbackData;
  }

  try {
    const parsed = JSON.parse(jsonString) as T;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallbackData;
  } catch (error) {
    console.error("Erro ao fazer parse do JSON no Local Storage:", error);
    return fallbackData;
  }
}

// Função principal para carregar dados: prioriza Local Storage, se falhar, usa mock
export function loadEditableData(): EditableData {
  const storedProcedures = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY_PROCEDURES) : null;
  const storedFlow = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY_CHECKLIST) : null;

  return {
    procedures: safeParseJson(storedProcedures, mockProcedures),
    flow: safeParseJson(storedFlow, mockTroubleshootingFlow),
  };
}

// Função para salvar Procedimentos no Local Storage
export function saveProceduresToLocalStorage(data: Procedure[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROCEDURES, JSON.stringify(data, null, 2));
    toast.success("Procedimentos salvos! Recarregue a página de Diagnóstico.");
  } catch (error) {
    console.error("Erro ao salvar procedimentos no Local Storage:", error);
    toast.error("Erro ao salvar procedimentos.");
  }
}

// Função para salvar Flow do Checklist no Local Storage
export function saveFlowToLocalStorage(data: ChecklistStep[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CHECKLIST, JSON.stringify(data, null, 2));
    toast.success("Checklist Flow salvo! Recarregue a página de Diagnóstico.");
  } catch (error) {
    console.error("Erro ao salvar flow no Local Storage:", error);
    toast.error("Erro ao salvar flow.");
  }
}

// Função para apagar dados e retornar aos mockados
export function resetToDefaults(): EditableData {
  localStorage.removeItem(LOCAL_STORAGE_KEY_PROCEDURES);
  localStorage.removeItem(LOCAL_STORAGE_KEY_CHECKLIST);
  toast.info("Dados de edição removidos. A aplicação usará os dados hardcoded (mockados).");

  return {
    procedures: mockProcedures,
    flow: mockTroubleshootingFlow,
  };
}
