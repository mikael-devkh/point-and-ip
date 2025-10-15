import { PDFDocument, StandardFonts } from "pdf-lib";
import ratTemplateUrl from "@/assets/rat-template.pdf?url";
import { RatFormData } from "@/types/rat";
import {
  equipamentoOptions,
  origemEquipamentoOptions,
  pecasCabosOptions,
  pecasImpressoraOptions,
} from "@/data/ratOptions";

export const generateRatPDF = async (formData: RatFormData) => {
  const existingPdfBytes = await fetch(ratTemplateUrl).then((res) => res.arrayBuffer());
  
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const smallFont = 7;

  const toPdfY = (yFromTop: number) => height - yFromTop;
  const drawCheckboxMark = (x: number, yFromTop: number, size = 8) => {
    firstPage.drawText("X", { x, y: toPdfY(yFromTop), size, font: fontBold });
  };
  const drawText = (text: string, x: number, yFromTop: number, size = 9) => {
    if (!text) return;
    firstPage.drawText(text, { x, y: toPdfY(yFromTop), size, font });
  };
  
  // Cabeçalho - Identificação
  drawText(formData.codigoLoja, 315, 104, 9);
  drawText(formData.pdv, 450, 104, 9);
  drawText(formData.fsa, 550, 104, 9);
  drawText(formData.endereco, 225, 131, 8);
  drawText(formData.cidade, 505, 131, 8);
  drawText(formData.uf, 610, 131, 8);
  drawText(formData.nomeSolicitante, 325, 157, 8);
  
  equipamentoOptions.forEach((option) => {
    if (formData.equipamentos.includes(option.value)) {
      drawCheckboxMark(option.pdfPosition.x, option.pdfPosition.yFromTop);
    }
  });

  // Dados do Equipamento - Coluna direita
  // Patrimônio
  drawText(formData.patrimonioNumeroSerie, 555, 211, 8);
  // Número Série ATIVO
  drawText(formData.patrimonioNumeroSerie, 470, 211, 8);
  // Equip. com defeito
  drawText(formData.equipComDefeito, 390, 223, 8);
  // Marca
  drawText(formData.marca, 355, 237, 8);
  // Modelo
  drawText(formData.modelo, 475, 237, 8);
  
  const origemSelecionada = origemEquipamentoOptions.find(
    (option) => option.value === formData.origemEquipamento
  );
  if (origemSelecionada) {
    drawCheckboxMark(
      origemSelecionada.pdfPosition.x,
      origemSelecionada.pdfPosition.yFromTop,
      7
    );
  }
  
  // Dados da troca
  if (formData.numeroSerieTroca) {
    drawText(formData.numeroSerieTroca, 490, 281, 8);
    drawText(formData.equipNovoRecond || "", 385, 293, 8);
    drawText(formData.marcaTroca, 355, 305, 8);
    drawText(formData.modeloTroca, 475, 305, 8);
  }
  
  // PEÇAS/CABOS - Checkboxes em 2 colunas
  pecasCabosOptions.forEach((option) => {
    if (formData.pecasCabos.includes(option.value)) {
      drawCheckboxMark(option.pdfPosition.x, option.pdfPosition.yFromTop);
    }
  });

  // PEÇAS IMPRESSORA - Checkboxes coluna direita
  pecasImpressoraOptions.forEach((option) => {
    if (formData.pecasImpressora.includes(option.value)) {
      drawCheckboxMark(option.pdfPosition.x, option.pdfPosition.yFromTop);
    }
  });
  
  // Mau uso checkboxes
  if (formData.mauUso === "sim") {
    drawCheckboxMark(548, 341);
  } else if (formData.mauUso === "nao") {
    drawCheckboxMark(598, 341);
  }

  const drawMultilineText = (
    text: string,
    x: number,
    startYFromTop: number,
    maxWidth: number,
    maxLines: number,
    options?: { fontSize?: number; lineHeight?: number }
  ) => {
    if (!text) return;

    const fontSize = options?.fontSize ?? smallFont;
    const lineHeight = options?.lineHeight ?? fontSize + 2;
    const words = text.split(/\s+/);
    let line = "";
    let lineCount = 0;
    let currentYFromTop = startYFromTop;

    for (const word of words) {
      const testLine = `${line}${word} `;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth && line.trim()) {
        if (lineCount >= maxLines) break;
        drawText(line.trim(), x, currentYFromTop, fontSize);
        line = `${word} `;
        currentYFromTop += lineHeight;
        lineCount++;
      } else {
        line = testLine;
      }
    }

    if (line.trim() && lineCount < maxLines) {
      drawText(line.trim(), x, currentYFromTop, fontSize);
    }
  };

  // Observações peças - campo de texto
  drawMultilineText(formData.observacoesPecas, 530, 415, 200, 3, {
    fontSize: 7,
    lineHeight: 9,
  });

  // Defeito/Problema
  drawMultilineText(formData.defeitoProblema, 112, 505, 520, 2, {
    fontSize: 8,
    lineHeight: 10,
  });

  // Diagnóstico/Testes
  drawMultilineText(formData.diagnosticoTestes, 50, 575, 580, 4, {
    fontSize: 8,
    lineHeight: 11,
  });

  // Solução
  drawMultilineText(formData.solucao, 50, 695, 580, 2, {
    fontSize: 8,
    lineHeight: 10,
  });
  
  // Problema resolvido - checkboxes
  if (formData.problemaResolvido === "sim") {
    drawCheckboxMark(142, 713);
  } else if (formData.problemaResolvido === "nao") {
    drawCheckboxMark(167, 713);
    drawMultilineText(formData.motivoNaoResolvido, 275, 713, 180, 1, {
      fontSize: 7,
      lineHeight: 9,
    });
  }

  // Haverá retorno - checkboxes
  if (formData.haveraRetorno === "sim") {
    drawCheckboxMark(580, 713);
  } else if (formData.haveraRetorno === "nao") {
    drawCheckboxMark(608, 713);
  }

  // Horários e Data
  drawText(formData.horaInicio, 115, 742, 8);
  drawText(formData.horaTermino, 255, 742, 8);

  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  drawText(dataFormatada, 545, 742, 8);
  
  // CLIENTE - Dados na coluna esquerda
  drawText(formData.clienteNome, 235, 764, 8);
  drawText(formData.clienteRgMatricula, 235, 780, 8);
  drawText(formData.clienteTelefone, 235, 796, 8);

  // PRESTADOR - Dados na coluna direita
  drawText(formData.prestadorNome, 500, 764, 8);
  drawText(formData.prestadorRgMatricula, 500, 780, 8);
  drawText(formData.prestadorTelefone, 500, 796, 8);
  
  // Salvar e abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
