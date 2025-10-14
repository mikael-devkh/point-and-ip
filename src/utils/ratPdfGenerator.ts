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
  
  drawText(formData.codigoLoja, 265, 138, 10);
  drawText(formData.pdv, 545, 138, 10);
  drawText(formData.fsa, 685, 138, 10);
  drawText(formData.endereco, 80, 164, 9);
  drawText(formData.cidade, 545, 164, 9);
  drawText(formData.uf, 775, 164, 9);
  drawText(formData.nomeSolicitante, 55, 190, 9);
  
  equipamentoOptions.forEach((option) => {
    if (formData.equipamentos.includes(option.value)) {
      drawCheckboxMark(option.pdfPosition.x, option.pdfPosition.yFromTop);
    }
  });

  // Dados do Equipamento - Coluna direita
  // Patrimônio
  drawText(formData.patrimonioNumeroSerie, 770, 234, 8);
  // Número Série ATIVO
  drawText(formData.patrimonioNumeroSerie, 470, 246, 8);
  // Equip. com defeito
  drawText(formData.equipComDefeito, 470, 258, 8);
  // Marca
  drawText(formData.marca, 455, 270, 8);
  // Modelo
  drawText(formData.modelo, 635, 270, 8);
  
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
    drawText(formData.numeroSerieTroca, 470, 318, 8);
    drawText(formData.equipNovoRecond || "", 470, 330, 8);
    drawText(formData.marcaTroca, 455, 342, 8);
    drawText(formData.modeloTroca, 635, 342, 8);
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
    drawCheckboxMark(695, 390);
  } else if (formData.mauUso === "nao") {
    drawCheckboxMark(740, 390);
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
  drawMultilineText(formData.observacoesPecas, 620, 408, 150, 8, {
    fontSize: 7,
    lineHeight: 9,
  });

  // Defeito/Problema
  drawMultilineText(formData.defeitoProblema, 55, 582, 760, 2);

  // Diagnóstico/Testes
  drawMultilineText(formData.diagnosticoTestes, 55, 622, 760, 5);

  // Solução
  drawMultilineText(formData.solucao, 55, 690, 760, 5);
  
  // Problema resolvido - checkboxes
  if (formData.problemaResolvido === "sim") {
    drawCheckboxMark(125, 738);
  } else if (formData.problemaResolvido === "nao") {
    drawCheckboxMark(155, 738);
    drawMultilineText(formData.motivoNaoResolvido, 280, 738, 200, 2, {
      fontSize: 7,
      lineHeight: 9,
    });
  }

  // Haverá retorno - checkboxes
  if (formData.haveraRetorno === "sim") {
    drawCheckboxMark(730, 738);
  } else if (formData.haveraRetorno === "nao") {
    drawCheckboxMark(760, 738);
  }

  // Horários e Data
  drawText(formData.horaInicio, 95, 755, 9);
  drawText(formData.horaTermino, 265, 755, 9);

  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  drawText(dataFormatada, 685, 755, 9);
  
  // CLIENTE - Dados na coluna esquerda
  drawText(formData.clienteNome, 120, 785, 9);
  drawText(formData.clienteRgMatricula, 145, 802, 9);
  drawText(formData.clienteTelefone, 95, 820, 9);

  // PRESTADOR - Dados na coluna direita
  drawText(formData.prestadorNome, 565, 785, 9);
  drawText(formData.prestadorRgMatricula, 565, 802, 9);
  drawText(formData.prestadorTelefone, 565, 820, 9);
  
  // Salvar e abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
