import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface RatFormData {
  codigoLoja: string;
  pdv: string;
  fsa: string;
  endereco: string;
  cidade: string;
  uf: string;
  nomeSolicitante: string;
  equipamentos: string[];
  patrimonioNumeroSerie: string;
  equipComDefeito: string;
  marca: string;
  modelo: string;
  origemEquipamento: string;
  numeroSerieTroca: string;
  equipNovoRecond: string;
  marcaTroca: string;
  modeloTroca: string;
  pecasCabos: string[];
  pecasImpressora: string[];
  mauUso: string;
  observacoesPecas: string;
  defeitoProblema: string;
  diagnosticoTestes: string;
  solucao: string;
  problemaResolvido: string;
  motivoNaoResolvido: string;
  haveraRetorno: string;
  horaInicio: string;
  horaTermino: string;
  data: string;
  clienteNome: string;
  clienteRgMatricula: string;
  clienteTelefone: string;
  prestadorNome: string;
  prestadorRgMatricula: string;
  prestadorTelefone: string;
}

export const generateRatPDF = async (formData: RatFormData) => {
  // Carregar o PDF template
  const templateUrl = "/rat-template.pdf";
  const existingPdfBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());
  
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 8;
  const smallFont = 7;
  
  // IDENTIFICAÇÃO (ajustado conforme o template)
  firstPage.drawText(formData.codigoLoja, { x: 280, y: height - 126, size: fontSize, font });
  firstPage.drawText(formData.pdv, { x: 380, y: height - 126, size: fontSize, font });
  firstPage.drawText(formData.fsa, { x: 490, y: height - 126, size: fontSize, font });
  firstPage.drawText(formData.endereco, { x: 100, y: height - 143, size: fontSize, font });
  firstPage.drawText(formData.cidade, { x: 380, y: height - 143, size: fontSize, font });
  firstPage.drawText(formData.uf, { x: 540, y: height - 143, size: fontSize, font });
  firstPage.drawText(formData.nomeSolicitante, { x: 50, y: height - 160, size: fontSize, font });
  
  // EQUIPAMENTOS ENVOLVIDOS - Marcar checkboxes dos equipamentos
  const equipmentPositions: { [key: string]: { x: number; y: number } } = {
    "01-PDV-Teclado": { x: 40, y: height - 197 },
    "02-PDV-Scanner": { x: 40, y: height - 206 },
    "03-PDV-Impressora": { x: 40, y: height - 215 },
    "04-PDV-Monitor": { x: 40, y: height - 224 },
    "05-PDV-Gaveta": { x: 40, y: height - 233 },
    "06-PDV-CPU": { x: 40, y: height - 242 },
    "07-Desktop-Gerente": { x: 222, y: height - 197 },
    "08-Desktop +Aqui": { x: 222, y: height - 206 },
    "09-Desktop-Almox.": { x: 222, y: height - 215 },
    "10-Desktop-Tesouraria": { x: 222, y: height - 224 },
    "11-Impressora-Zebra/Printronix": { x: 222, y: height - 233 },
    "12-Outros": { x: 222, y: height - 242 },
  };
  
  formData.equipamentos.forEach((equip) => {
    const pos = equipmentPositions[equip];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Dados do Equipamento
  firstPage.drawText(formData.patrimonioNumeroSerie, { x: 450, y: height - 197, size: smallFont, font });
  firstPage.drawText(formData.equipComDefeito, { x: 450, y: height - 206, size: smallFont, font });
  firstPage.drawText(formData.marca, { x: 450, y: height - 224, size: smallFont, font });
  firstPage.drawText(formData.modelo, { x: 510, y: height - 224, size: smallFont, font });
  
  // Origem do equipamento - checkbox na linha de marcação
  const origemY = height - 246;
  if (formData.origemEquipamento.includes("E1-Novo Delfia")) {
    firstPage.drawText("X", { x: 355, y: origemY, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E2-Novo Parceiro")) {
    firstPage.drawText("X", { x: 410, y: origemY, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E3-Recond. Delfia")) {
    firstPage.drawText("X", { x: 473, y: origemY, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E4-Equip.Americanas")) {
    firstPage.drawText("X", { x: 545, y: origemY, size: 7, font: fontBold });
  }
  
  const origemY2 = height - 255;
  if (formData.origemEquipamento.includes("E5-Peça-Delfia")) {
    firstPage.drawText("X", { x: 355, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E6-Peça-Parceiro")) {
    firstPage.drawText("X", { x: 410, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E7-Peça-Americanas")) {
    firstPage.drawText("X", { x: 473, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E8-Garantia Schalter")) {
    firstPage.drawText("X", { x: 545, y: origemY2, size: 7, font: fontBold });
  }
  
  const origemY3 = height - 264;
  if (formData.origemEquipamento.includes("E9-Garantia Delfia")) {
    firstPage.drawText("X", { x: 355, y: origemY3, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E10-Garantia Parceiro")) {
    firstPage.drawText("X", { x: 428, y: origemY3, size: 7, font: fontBold });
  }
  
  // Dados da troca
  if (formData.numeroSerieTroca) {
    firstPage.drawText(formData.numeroSerieTroca, { x: 140, y: height - 278, size: smallFont, font });
    firstPage.drawText(formData.equipNovoRecond || "", { x: 320, y: height - 278, size: smallFont, font });
    firstPage.drawText(formData.marcaTroca, { x: 140, y: height - 287, size: smallFont, font });
    firstPage.drawText(formData.modeloTroca, { x: 320, y: height - 287, size: smallFont, font });
  }
  
  // PEÇAS/CABOS - Marcar checkboxes
  const pecasCabosPositions: { [key: string]: { x: number; y: number } } = {
    "13-CPU/Desktop-HD/SSD": { x: 40, y: height - 330 },
    "14-CPU/Desktop-Memória": { x: 40, y: height - 339 },
    "15-CPU/Desktop-Fonte Interna": { x: 40, y: height - 348 },
    "16-CPU/Desktop-Fonte Externa": { x: 40, y: height - 357 },
    "17-CPU/Desktop-Mother Board": { x: 40, y: height - 366 },
    "18-CPU/Desktop-Botão Power": { x: 40, y: height - 375 },
    "19-CPU/Desktop-Gabinete": { x: 40, y: height - 384 },
    "20-CPU/Desktop-Teclado ABNT": { x: 40, y: height - 393 },
    "21-CPU/Desktop-Bateria CMOS": { x: 40, y: height - 402 },
    "22-Imp-PDV-Fonte": { x: 40, y: height - 411 },
    "23-Imp-PDV-Placa Lógica": { x: 40, y: height - 420 },
    "24-Imp-PDV-Tampa": { x: 40, y: height - 429 },
    "25-Gaveta-Miolo": { x: 40, y: height - 438 },
    "26-Gaveta-Solenoide": { x: 222, y: height - 330 },
    "27-Gaveta-Miolo": { x: 222, y: height - 339 },
    "28-Gaveta-Chave": { x: 222, y: height - 348 },
    "29-Gaveta-Cabo RJ": { x: 222, y: height - 357 },
    "30-Monitor-Base": { x: 222, y: height - 366 },
    "31-Monitor-Fonte": { x: 222, y: height - 375 },
    "32-Cabo-Scanner": { x: 222, y: height - 384 },
    "33-Cabo-Teclado": { x: 222, y: height - 393 },
    "34-Cabo-Força": { x: 222, y: height - 402 },
    "35-Cabo-VGA/HDI": { x: 222, y: height - 411 },
    "36-Cabo-USB": { x: 222, y: height - 420 },
    "37-Cabo-Sata": { x: 222, y: height - 429 },
  };
  
  formData.pecasCabos.forEach((peca) => {
    const pos = pecasCabosPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // PEÇAS IMPRESSORA - Marcar checkboxes
  const pecasImpressoraPositions: { [key: string]: { x: number; y: number } } = {
    "39-Cabeça Imp.": { x: 402, y: height - 330 },
    "40-Sup. Cabeça": { x: 402, y: height - 339 },
    "41-Platen": { x: 402, y: height - 348 },
    "42-Sensor Cabeça": { x: 402, y: height - 357 },
    "43-Sensor Etiqueta": { x: 402, y: height - 366 },
    "44-Placa Lógica": { x: 402, y: height - 375 },
    "45-Placa Fonte": { x: 402, y: height - 384 },
    "46-Fonte Externa": { x: 402, y: height - 393 },
    "47-Trava Cabeça": { x: 402, y: height - 402 },
    "48-Kit Engrenagens": { x: 402, y: height - 411 },
    "49-Correia": { x: 402, y: height - 420 },
    "50-Painel": { x: 402, y: height - 429 },
    "51-Print Server": { x: 402, y: height - 438 },
  };
  
  formData.pecasImpressora.forEach((peca) => {
    const pos = pecasImpressoraPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Mau uso checkbox
  if (formData.mauUso === "sim") {
    firstPage.drawText("X", { x: 535, y: height - 330, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 555, y: height - 330, size: 8, font: fontBold });
  }
  
  // Observações peças
  if (formData.observacoesPecas) {
    const maxWidth = 120;
    let text = formData.observacoesPecas;
    if (font.widthOfTextAtSize(text, smallFont) > maxWidth) {
      while (font.widthOfTextAtSize(text + "...", smallFont) > maxWidth && text.length > 0) {
        text = text.slice(0, -1);
      }
      text += "...";
    }
    firstPage.drawText(text, { x: 467, y: height - 348, size: smallFont, font });
  }
  
  // LAUDO TÉCNICO
  const drawMultilineText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(" ");
    let line = "";
    let y = startY;
    
    words.forEach((word) => {
      const testLine = line + word + " ";
      const textWidth = font.widthOfTextAtSize(testLine, smallFont);
      
      if (textWidth > maxWidth && line !== "") {
        firstPage.drawText(line.trim(), { x, y, size: smallFont, font });
        line = word + " ";
        y -= lineHeight;
      } else {
        line = testLine;
      }
    });
    
    if (line.trim()) {
      firstPage.drawText(line.trim(), { x, y, size: smallFont, font });
    }
  };
  
  // Defeito/Problema
  if (formData.defeitoProblema) {
    drawMultilineText(formData.defeitoProblema, 50, height - 473, 520, 9);
  }
  
  // Diagnóstico/Testes
  if (formData.diagnosticoTestes) {
    drawMultilineText(formData.diagnosticoTestes, 50, height - 510, 520, 9);
  }
  
  // Solução
  if (formData.solucao) {
    drawMultilineText(formData.solucao, 50, height - 570, 520, 9);
  }
  
  // Problema resolvido
  if (formData.problemaResolvido === "sim") {
    firstPage.drawText("X", { x: 203, y: height - 630, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 219, y: height - 630, size: 8, font: fontBold });
    if (formData.motivoNaoResolvido) {
      firstPage.drawText(formData.motivoNaoResolvido.substring(0, 40), { 
        x: 285, y: height - 630, size: smallFont, font 
      });
    }
  }
  
  // Haverá retorno
  if (formData.haveraRetorno === "sim") {
    firstPage.drawText("X", { x: 523, y: height - 630, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 541, y: height - 630, size: 8, font: fontBold });
  }
  
  // Horários e Data
  firstPage.drawText(formData.horaInicio, { x: 90, y: height - 647, size: fontSize, font });
  firstPage.drawText(formData.horaTermino, { x: 248, y: height - 647, size: fontSize, font });
  
  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  firstPage.drawText(dataFormatada, { x: 480, y: height - 647, size: fontSize, font });
  
  // CLIENTE
  firstPage.drawText(formData.clienteNome, { x: 95, y: height - 677, size: fontSize, font });
  firstPage.drawText(formData.clienteRgMatricula, { x: 130, y: height - 697, size: fontSize, font });
  firstPage.drawText(formData.clienteTelefone, { x: 95, y: height - 717, size: fontSize, font });
  
  // PRESTADOR
  firstPage.drawText(formData.prestadorNome, { x: 425, y: height - 677, size: fontSize, font });
  firstPage.drawText(formData.prestadorRgMatricula, { x: 460, y: height - 697, size: fontSize, font });
  firstPage.drawText(formData.prestadorTelefone, { x: 425, y: height - 717, size: fontSize, font });
  
  // Salvar e abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
