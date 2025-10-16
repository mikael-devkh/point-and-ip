import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";
import ratTemplateUrl from "@/assets/rat-template.pdf?url";
import { RatFormData } from "@/types/rat";
import {
  equipamentoOptions,
  origemEquipamentoOptions,
  pecasCabosOptions,
  pecasImpressoraOptions,
} from "@/data/ratOptions";

const log = (...args: any[]) => console.debug("[RAT]", ...args);

// Helper para setar texto em campos do formulário
function setTextSafe(form: any, fieldName: string, value?: string) {
  try {
    if (value === undefined || value === null) return;
    const v = String(value);
    if (!v) return;
    form.getTextField(fieldName).setText(v);
  } catch {
    try {
      form.getDropdown(fieldName).select(String(value));
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

    // Log dos campos disponíveis para debug
    try {
      const fields = form.getFields().map((f: any) => f.getName());
      log("Campos disponíveis no PDF:", fields);
    } catch (e) {
      log("Não foi possível listar campos:", e);
    }

    // IDENTIFICAÇÃO
    setTextSafe(form, "CódigodaLoja", formData.codigoLoja);
    setTextSafe(form, "PDV", formData.pdv);
    setTextSafe(form, "FSA", formData.fsa);
    setTextSafe(form, "Endereço", formData.endereco);
    setTextSafe(form, "Cidade", formData.cidade);
    setTextSafe(form, "UF", formData.uf);
    setTextSafe(form, "Nomedosolicitante", formData.nomeSolicitante);

    // EQUIPAMENTOS ENVOLVIDOS - Checkboxes
    formData.equipamentos.forEach((equip) => {
      const option = equipamentoOptions.find((item) => item.value === equip);
      if (!option) return;
      drawMark(page, font, pageHeight, option.pdfPosition.x, option.pdfPosition.yFromTop);
    });

    // DADOS DO EQUIPAMENTO
    setTextSafe(form, "Serial", formData.patrimonioNumeroSerie);
    setTextSafe(form, "Patrimonio", formData.patrimonioNumeroSerie);
    setTextSafe(form, "Marca", formData.marca);
    setTextSafe(form, "Modelo", formData.modelo);

    const equipDefeitoLines = splitLines(formData.equipComDefeito, 3);
    setTextSafe(form, "Row1", equipDefeitoLines[0]);
    setTextSafe(form, "Row2", equipDefeitoLines[1]);
    setTextSafe(form, "Row3", equipDefeitoLines[2]);

    // ORIGEM DO EQUIPAMENTO
    const origemOption = origemEquipamentoOptions.find(
      (option) => option.value === formData.origemEquipamento,
    );
    if (origemOption) {
      drawMark(page, font, pageHeight, origemOption.pdfPosition.x, origemOption.pdfPosition.yFromTop);
    }

    // DADOS DA TROCA
    if (formData.numeroSerieTroca) {
      setTextSafe(form, "SerialNovo", formData.numeroSerieTroca);
    }
    setTextSafe(form, "MarcaNovo", formData.marcaTroca);
    setTextSafe(form, "ModeloNovo", formData.modeloTroca);
    setTextSafe(form, "Origem", formData.equipNovoRecond);

    // PEÇAS/CABOS - Checkboxes
    formData.pecasCabos?.forEach((peca) => {
      const option = pecasCabosOptions.find((item) => item.value === peca);
      if (!option) return;
      drawMark(page, font, pageHeight, option.pdfPosition.x, option.pdfPosition.yFromTop);
    });

    // PEÇAS IMPRESSORA - Checkboxes
    formData.pecasImpressora?.forEach((peca) => {
      const option = pecasImpressoraOptions.find((item) => item.value === peca);
      if (!option) return;
      drawMark(page, font, pageHeight, option.pdfPosition.x, option.pdfPosition.yFromTop);
    });

    // MAU USO
    if (formData.mauUso === "sim") {
      drawMark(page, font, pageHeight, 407, 522);
    } else if (formData.mauUso === "nao") {
      drawMark(page, font, pageHeight, 480, 522);
    }

    // OBSERVAÇÕES PEÇAS
    setTextSafe(form, "Observações", formData.observacoesPecas);

    // DEFEITO/PROBLEMA
    const defeitoLines = splitLines(formData.defeitoProblema, 2);
    setTextSafe(form, "DefeitoProblemaRow1", defeitoLines[0]);
    setTextSafe(form, "DefeitoProblemaRow2", defeitoLines[1]);

    // DIAGNÓSTICO/TESTES
    const diagnosticoLines = splitLines(formData.diagnosticoTestes, 4);
    setTextSafe(form, "DiagnósticoTestesrealizadosRow1", diagnosticoLines[0]);
    setTextSafe(form, "DiagnósticoTestesrealizadosRow2", diagnosticoLines[1]);
    setTextSafe(form, "DiagnósticoTestesrealizadosRow3", diagnosticoLines[2]);
    setTextSafe(form, "DiagnósticoTestesrealizadosRow4", diagnosticoLines[3]);

    // SOLUÇÃO
    const solucaoLines = splitLines(formData.solucao, 1);
    setTextSafe(form, "SoluçãoRow1", solucaoLines[0]);

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
    
    const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
    setTextSafe(form, "DATA", dataFormatada);

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
    const bytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(Array.from(bytes)).buffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    
    log("PDF gerado com sucesso!");
    return { url };
  } catch (error) {
    console.error("[RAT] Erro ao gerar PDF:", error);
    throw error;
  }
};
