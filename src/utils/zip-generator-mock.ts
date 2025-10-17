import { ActiveCall, RequiredMediaType } from "@/hooks/use-service-manager";

const getMediaFileName = (media: RequiredMediaType) => {
  switch (media) {
    case "serial":
      return "serial-equipamento.jpg";
    case "defect_photo":
      return "defeito.jpg";
    case "solution_video":
      return "solucao.mp4";
    case "workbench_photo":
      return "bancada.jpg";
    case "replacement_serial":
      return "serial-troca.jpg";
    default:
      return `${media}.dat`;
  }
};

export const generateZipMock = (call: ActiveCall) => {
  const fileName = `FSA-${call.fsa}_EVIDENCIAS.zip`;
  const mediaEntries = Object.entries(call.photos).map(([key, value]) => {
    const mediaKey = key as RequiredMediaType;
    const preview = value.dataUrl ? value.dataUrl.slice(0, 60) : "-- sem base64 --";
    return [
      `Arquivo: ${getMediaFileName(mediaKey)}`,
      `Status: ${value.status}`,
      `Prévia Base64: ${preview}`,
      "",
    ].join("\n");
  });

  const summaryLines = [
    `Chamado: ${call.fsa}`,
    `Loja: ${call.codigoLoja}`,
    call.pdv ? `PDV: ${call.pdv}` : undefined,
    `Status: ${call.status}`,
    `Tempo total registrado: ${call.timeTotalServiceMinutes} minutos`,
    "",
    "--- Evidências mockadas ---",
    "",
    ...mediaEntries,
  ].filter((line): line is string => Boolean(line));

  const blob = new Blob([summaryLines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
