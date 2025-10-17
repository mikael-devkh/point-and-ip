import { ActiveCall } from "@/hooks/use-service-manager";

export const generateZipMock = (call: ActiveCall) => {
  const fileName = `FSA-${call.fsa}_EVIDENCIAS.zip`;
  const summaryLines = [
    `Chamado: ${call.fsa}`,
    `Loja: ${call.codigoLoja}`,
    call.pdv ? `PDV: ${call.pdv}` : null,
    `Status: ${call.status}`,
    `Tempo total registrado: ${call.timeTotalServiceMinutes} minutos`,
    "Checklist de mídias:",
    ...Object.entries(call.photos).map(
      ([key, value]) => `- ${key}: ${value === "uploaded" ? "ok" : "pendente"}`
    ),
  ]
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([summaryLines], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
