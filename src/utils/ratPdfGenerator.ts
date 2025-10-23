import {
  PDFDocument,
  PDFPage,
  PDFFont,
  PDFTextField,
  StandardFonts,
  rgb,
} from "pdf-lib";
import ratTemplateUrl from "../assets/rat-template.pdf?url";
import { RatFormData } from "../types/rat";
import { origemEquipamentoOptions } from "../data/ratOptions";

const log = (...args: any[]) => console.debug("[RAT]", ...args);

const sanitizeFilenamePart = (value?: string | null) => {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
};

const buildRatFilename = (formData: RatFormData) => {
  const parts = [
    "rat",
    sanitizeFilenamePart(formData.codigoLoja),
    sanitizeFilenamePart(formData.pdv),
    sanitizeFilenamePart(formData.fsa),
  ].filter(Boolean);

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0];

  const base = parts.length > 0 ? parts.join("-") : "rat";
  return `${base}-${timestamp}.pdf`;
};

const triggerBrowserDownload = (url: string, filename: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

// Helper para setar texto em campos do formulário
function setTextSafe(form: any, fieldName: string, value?: string | null) {
  const textValue = value === undefined || value === null ? "" : String(value);
  try {
    form.getTextField(fieldName).setText(textValue);
  } catch {
    if (!textValue) return;
    try {
      form.getDropdown(fieldName).select(textValue);
    } catch {}
  }
}

// Helper para dividir texto em linhas
const splitLines = (text?: string, maxLines = 4) =>
  (text ?? "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, maxLines);

const getOrigemCodigo = (value?: string) => {
  if (!value) return "";
  const [codigo] = value.split("-");
  return codigo?.trim() ?? "";
};

const formatDateBr = (value?: string) => {
  if (!value) return "";
  const [datePart] = value.split("T");
  const match = datePart?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("pt-BR");
};

const normalizeHour = (hour?: string) => (hour ? hour.replace(/\s+/g, "") : hour);

const drawMark = (
  page: PDFPage,
  font: PDFFont,
  pageHeight: number,
  x: number,
  yFromTop: number,
  size = 12,
) => {
  page.drawText("X", {
    x,
    y: pageHeight - yFromTop,
    size,
    font,
    color: rgb(0, 0, 0),
  });
};

export const generateRatPDF = async (formData: RatFormData) => {
  try {
    log("Carregando template RAT...");
    const pdfBytes = await fetch(ratTemplateUrl).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const pageHeight = page.getHeight();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Limpa qualquer valor pré-existente no template antes de preencher
    try {
      form.getFields().forEach((field) => {
        if (field instanceof PDFTextField) {
          field.setText("");
        }
      });
    } catch (e) {
      log("Não foi possível limpar os campos do formulário:", e);
    }

    // IDENTIFICAÇÃO
    setTextSafe(form, "CódigodaLoja", formData.codigoLoja);
    setTextSafe(form, "PDV", formData.pdv);
    setTextSafe(form, "FSA", formData.fsa);
    setTextSafe(form, "Endereço", formData.endereco);
    setTextSafe(form, "Cidade", formData.cidade);
    setTextSafe(form, "UF", formData.uf);
    setTextSafe(form, "Nomedosolicitante", formData.nomeSolicitante);

    // EQUIPAMENTOS ENVOLVIDOS - Removido

    // DADOS DO EQUIPAMENTO
    setTextSafe(form, "Serial", formData.serial);
    setTextSafe(form, "Patrimonio", formData.patrimonio);
    setTextSafe(form, "Marca", formData.marca);
    setTextSafe(form, "Modelo", formData.modelo);

    const possuiTroca =
      formData.houveTroca === "sim" || (!formData.houveTroca && !!formData.origemEquipamento);

    if (possuiTroca) {
      if (formData.origemEquipamento) {
        const origemOption = origemEquipamentoOptions.find(
          (option) => option.value === formData.origemEquipamento,
        );
        if (origemOption) {
          setTextSafe(form, "Origem", getOrigemCodigo(origemOption.value));
        } else if (formData.equipNovoRecond) {
          setTextSafe(form, "Origem", formData.equipNovoRecond);
        }
      } else if (formData.equipNovoRecond) {
        setTextSafe(form, "Origem", formData.equipNovoRecond);
      }

      if (formData.numeroSerieTroca) {
        setTextSafe(form, "SerialNovo", formData.numeroSerieTroca);
      }
      setTextSafe(form, "MarcaNovo", formData.marcaTroca);
      setTextSafe(form, "ModeloNovo", formData.modeloTroca);
    }

    // PEÇAS/CABOS - Removido
    
    // PEÇAS IMPRESSORA - Removido

    // MAU USO
    const mauUsoMarkYFromTop = 322;
    if (formData.mauUso === "sim") {
      drawMark(page, font, pageHeight, 407, mauUsoMarkYFromTop);
    } else if (formData.mauUso === "nao") {
      drawMark(page, font, pageHeight, 480, mauUsoMarkYFromTop);
    }

    // OBSERVAÇÕES PEÇAS
    const observacoesLines = splitLines(formData.observacoesPecas, 3);
    setTextSafe(form, "Row1", observacoesLines[0] ?? "");
    setTextSafe(form, "Row2", observacoesLines[1] ?? "");
    setTextSafe(form, "Row3", observacoesLines[2] ?? "");

    // DEFEITO/PROBLEMA
    const defeitoLines = splitLines(formData.defeitoProblema, 2);
    setTextSafe(form, "DefeitoProblemaRow1", defeitoLines[0] ?? "");
    setTextSafe(form, "DefeitoProblemaRow2", defeitoLines[1] ?? "");

    // DIAGNÓSTICO/TESTES
    const diagnosticoLines = splitLines(formData.diagnosticoTestes, 4);
    setTextSafe(form, "DiagnósticoTestesrealizadosRow1", diagnosticoLines[0] ?? "");
    setTextSafe(form, "DiagnósticoTestesrealizadosRow2", diagnosticoLines[1] ?? "");
    setTextSafe(form, "DiagnósticoTestesrealizadosRow3", diagnosticoLines[2] ?? "");
    setTextSafe(form, "DiagnósticoTestesrealizadosRow4", diagnosticoLines[3] ?? "");

    // SOLUÇÃO
    const solucaoLines = splitLines(formData.solucao, 1);
    setTextSafe(form, "SoluçãoRow1", solucaoLines[0] ?? "");

    // PROBLEMA RESOLVIDO
    if (formData.problemaResolvido === "sim") {
      setTextSafe(form, "SimProblemaresolvido", "X");
    } else if (formData.problemaResolvido === "nao") {
      setTextSafe(form, "NãoProblemaresolvido", "X");
      setTextSafe(form, "Motivo", formData.motivoNaoResolvido);
    }

    // HAVERÁ RETORNO
    if (formData.haveraRetorno === "sim") {
      setTextSafe(form, "SimHaveráretorno", "X");
    } else if (formData.haveraRetorno === "nao") {
      setTextSafe(form, "NãoHaveráretorno", "X");
    }

    // HORÁRIOS E DATA
    setTextSafe(form, "Horainício", normalizeHour(formData.horaInicio));
    setTextSafe(form, "Horatérmino", normalizeHour(formData.horaTermino));
    
    setTextSafe(form, "DATA", formatDateBr(formData.data));

    // CLIENTE
    setTextSafe(form, "NOMELEGÍVEL", formData.clienteNome);
    setTextSafe(form, "RGOUMATRÍCULA", formData.clienteRgMatricula);
    setTextSafe(form, "TELEFONE", formData.clienteTelefone);

    // PRESTADOR
    setTextSafe(form, "NOMELEGÍVEL_2", formData.prestadorNome);
    setTextSafe(form, "MATRÍCULA", formData.prestadorRgMatricula);
    setTextSafe(form, "TELEFONE_2", formData.prestadorTelefone);

    // Achatar o formulário para tornar os campos não-editáveis
    try {
      form.flatten();
    } catch (e) {
      log("Não foi possível achatar o formulário:", e);
    }

    // Salvar e abrir PDF
    const fileName = buildRatFilename(formData);
    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const cleanupUrl = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    };

    const shareSupported =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    if (shareSupported) {
      const shareData: ShareData = { title: "RAT", text: fileName };
      const canShareFiles =
        typeof navigator.canShare === "function" && typeof File !== "undefined";

      if (typeof File !== "undefined") {
        try {
          const file = new File([blob], fileName, { type: blob.type });
          if (!canShareFiles || navigator.canShare?.({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (error) {
          log("Falha ao preparar arquivo para compartilhamento.", error);
        }
      }

      if (!shareData.files?.length) {
        shareData.url = url;
      }

      try {
        await navigator.share(shareData);
        cleanupUrl();
        log("PDF compartilhado via Web Share API.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          cleanupUrl();
          log("Compartilhamento cancelado pelo usuário.");
          return;
        }

        log("Falha ao compartilhar via Web Share API, tentando fallback.", error);
      }
    }
    triggerBrowserDownload(url, fileName);

    if (typeof window !== "undefined" && typeof window.open === "function") {
      try {
        const openedWindow = window.open(url, "_blank");
        if (!openedWindow) {
          log("Popup bloqueado, mantendo apenas o download automático.");
        }
      } catch (error) {
        log("Não foi possível abrir nova janela para o PDF.", error);
      }
    }

    setTimeout(cleanupUrl, 60_000);

    log("PDF gerado com sucesso!");
    return { url };
  } catch (error) {
    console.error("[RAT] Erro ao gerar PDF:", error);
    throw error;
  }
};
