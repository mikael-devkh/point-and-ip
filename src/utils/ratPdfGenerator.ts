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
  const fontSize = 9;
  const smallFont = 7;
  
  // IDENTIFICAÇÃO - Campos na linha horizontal
  // Código da Loja
  firstPage.drawText(formData.codigoLoja, { x: 280, y: height - 128, size: fontSize, font });
  // PDV
  firstPage.drawText(formData.pdv, { x: 385, y: height - 128, size: fontSize, font });
  // FSA
  firstPage.drawText(formData.fsa, { x: 495, y: height - 128, size: fontSize, font });
  // Endereço
  firstPage.drawText(formData.endereco, { x: 100, y: height - 145, size: fontSize, font });
  // Cidade
  firstPage.drawText(formData.cidade, { x: 385, y: height - 145, size: fontSize, font });
  // UF
  firstPage.drawText(formData.uf, { x: 545, y: height - 145, size: fontSize, font });
  // Nome do solicitante
  firstPage.drawText(formData.nomeSolicitante, { x: 50, y: height - 162, size: fontSize, font });
  
  // EQUIPAMENTOS ENVOLVIDOS - Checkboxes
  const equipmentPositions: { [key: string]: { x: number; y: number } } = {
    "01-PDV-Teclado": { x: 42, y: height - 199 },
    "02-PDV-Scanner": { x: 42, y: height - 208 },
    "03-PDV-Impressora": { x: 42, y: height - 217 },
    "04-PDV-Monitor": { x: 42, y: height - 226 },
    "05-PDV-Gaveta": { x: 42, y: height - 235 },
    "06-PDV-CPU": { x: 42, y: height - 244 },
    "07-Desktop-Gerente": { x: 224, y: height - 199 },
    "08-Desktop +Aqui": { x: 224, y: height - 208 },
    "09-Desktop-Almox.": { x: 224, y: height - 217 },
    "10-Desktop-Tesouraria": { x: 224, y: height - 226 },
    "11-Impressora-Zebra/Printronix": { x: 224, y: height - 235 },
    "12-Outros": { x: 224, y: height - 244 },
  };
  
  formData.equipamentos.forEach((equip) => {
    const pos = equipmentPositions[equip];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Dados do Equipamento - Coluna direita
  // Número Série ATIVO
  firstPage.drawText(formData.patrimonioNumeroSerie, { x: 453, y: height - 199, size: smallFont, font });
  // Equip. com defeito
  firstPage.drawText(formData.equipComDefeito, { x: 453, y: height - 208, size: smallFont, font });
  // Marca
  firstPage.drawText(formData.marca, { x: 453, y: height - 226, size: smallFont, font });
  // Modelo
  firstPage.drawText(formData.modelo, { x: 515, y: height - 226, size: smallFont, font });
  
  // Origem do equipamento - 3 linhas de checkboxes
  // Linha 1: E1, E2, E3, E4
  const origemY1 = height - 248;
  if (formData.origemEquipamento.includes("E1-Novo Delfia")) {
    firstPage.drawText("X", { x: 357, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E2-Novo Parceiro")) {
    firstPage.drawText("X", { x: 413, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E3-Recond. Delfia")) {
    firstPage.drawText("X", { x: 478, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E4-Equip.Americanas")) {
    firstPage.drawText("X", { x: 548, y: origemY1, size: 7, font: fontBold });
  }
  
  // Linha 2: E5, E6, E7, E8
  const origemY2 = height - 257;
  if (formData.origemEquipamento.includes("E5-Peça-Delfia")) {
    firstPage.drawText("X", { x: 357, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E6-Peça-Parceiro")) {
    firstPage.drawText("X", { x: 413, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E7-Peça-Americanas")) {
    firstPage.drawText("X", { x: 478, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E8-Garantia Schalter")) {
    firstPage.drawText("X", { x: 548, y: origemY2, size: 7, font: fontBold });
  }
  
  // Linha 3: E9, E10
  const origemY3 = height - 266;
  if (formData.origemEquipamento.includes("E9-Garantia Delfia")) {
    firstPage.drawText("X", { x: 357, y: origemY3, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E10-Garantia Parceiro")) {
    firstPage.drawText("X", { x: 430, y: origemY3, size: 7, font: fontBold });
  }
  
  // Dados da troca
  if (formData.numeroSerieTroca) {
    firstPage.drawText(formData.numeroSerieTroca, { x: 145, y: height - 281, size: smallFont, font });
    firstPage.drawText(formData.equipNovoRecond || "", { x: 325, y: height - 281, size: smallFont, font });
    firstPage.drawText(formData.marcaTroca, { x: 145, y: height - 290, size: smallFont, font });
    firstPage.drawText(formData.modeloTroca, { x: 325, y: height - 290, size: smallFont, font });
  }
  
  // PEÇAS/CABOS - Checkboxes em 2 colunas
  const pecasCabosPositions: { [key: string]: { x: number; y: number } } = {
    "13-CPU/Desktop-HD/SSD": { x: 42, y: height - 333 },
    "14-CPU/Desktop-Memória": { x: 42, y: height - 342 },
    "15-CPU/Desktop-Fonte Interna": { x: 42, y: height - 351 },
    "16-CPU/Desktop-Fonte Externa": { x: 42, y: height - 360 },
    "17-CPU/Desktop-Mother Board": { x: 42, y: height - 369 },
    "18-CPU/Desktop-Botão Power": { x: 42, y: height - 378 },
    "19-CPU/Desktop-Gabinete": { x: 42, y: height - 387 },
    "20-CPU/Desktop-Teclado ABNT": { x: 42, y: height - 396 },
    "21-CPU/Desktop-Bateria CMOS": { x: 42, y: height - 405 },
    "22-Imp-PDV-Fonte": { x: 42, y: height - 414 },
    "23-Imp-PDV-Placa Lógica": { x: 42, y: height - 423 },
    "24-Imp-PDV-Tampa": { x: 42, y: height - 432 },
    "25-Gaveta-Miolo": { x: 42, y: height - 441 },
    "26-Gaveta-Solenoide": { x: 224, y: height - 333 },
    "27-Gaveta-Miolo": { x: 224, y: height - 342 },
    "28-Gaveta-Chave": { x: 224, y: height - 351 },
    "29-Gaveta-Cabo RJ": { x: 224, y: height - 360 },
    "30-Monitor-Base": { x: 224, y: height - 369 },
    "31-Monitor-Fonte": { x: 224, y: height - 378 },
    "32-Cabo-Scanner": { x: 224, y: height - 387 },
    "33-Cabo-Teclado": { x: 224, y: height - 396 },
    "34-Cabo-Força": { x: 224, y: height - 405 },
    "35-Cabo-VGA/HDI": { x: 224, y: height - 414 },
    "36-Cabo-USB": { x: 224, y: height - 423 },
    "37-Cabo-Sata": { x: 224, y: height - 432 },
  };
  
  formData.pecasCabos.forEach((peca) => {
    const pos = pecasCabosPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // PEÇAS IMPRESSORA - Checkboxes coluna direita
  const pecasImpressoraPositions: { [key: string]: { x: number; y: number } } = {
    "39-Cabeça Imp.": { x: 404, y: height - 333 },
    "40-Sup. Cabeça": { x: 404, y: height - 342 },
    "41-Platen": { x: 404, y: height - 351 },
    "42-Sensor Cabeça": { x: 404, y: height - 360 },
    "43-Sensor Etiqueta": { x: 404, y: height - 369 },
    "44-Placa Lógica": { x: 404, y: height - 378 },
    "45-Placa Fonte": { x: 404, y: height - 387 },
    "46-Fonte Externa": { x: 404, y: height - 396 },
    "47-Trava Cabeça": { x: 404, y: height - 405 },
    "48-Kit Engrenagens": { x: 404, y: height - 414 },
    "49-Correia": { x: 404, y: height - 423 },
    "50-Painel": { x: 404, y: height - 432 },
    "51-Print Server": { x: 404, y: height - 441 },
  };
  
  formData.pecasImpressora.forEach((peca) => {
    const pos = pecasImpressoraPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Mau uso checkboxes
  if (formData.mauUso === "sim") {
    firstPage.drawText("X", { x: 537, y: height - 333, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 557, y: height - 333, size: 8, font: fontBold });
  }
  
  // Observações peças - campo de texto
  if (formData.observacoesPecas) {
    const lines = formData.observacoesPecas.match(/.{1,50}/g) || [];
    lines.slice(0, 3).forEach((line, index) => {
      firstPage.drawText(line, { 
        x: 470, 
        y: height - 351 - (index * 9), 
        size: smallFont, 
        font 
      });
    });
  }
  
  // LAUDO TÉCNICO - Campos de texto grandes
  const drawMultilineText = (text: string, x: number, startY: number, maxWidth: number, maxLines: number) => {
    const words = text.split(" ");
    let line = "";
    let y = startY;
    let lineCount = 0;
    
    for (const word of words) {
      const testLine = line + word + " ";
      const textWidth = font.widthOfTextAtSize(testLine, smallFont);
      
      if (textWidth > maxWidth && line !== "") {
        if (lineCount >= maxLines) break;
        firstPage.drawText(line.trim(), { x, y, size: smallFont, font });
        line = word + " ";
        y -= 9;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    if (line.trim() && lineCount < maxLines) {
      firstPage.drawText(line.trim(), { x, y, size: smallFont, font });
    }
  };
  
  // Defeito/Problema
  if (formData.defeitoProblema) {
    drawMultilineText(formData.defeitoProblema, 50, height - 478, 520, 4);
  }
  
  // Diagnóstico/Testes
  if (formData.diagnosticoTestes) {
    drawMultilineText(formData.diagnosticoTestes, 50, height - 520, 520, 6);
  }
  
  // Solução
  if (formData.solucao) {
    drawMultilineText(formData.solucao, 50, height - 585, 520, 6);
  }
  
  // Problema resolvido - checkboxes
  if (formData.problemaResolvido === "sim") {
    firstPage.drawText("X", { x: 205, y: height - 634, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 221, y: height - 634, size: 8, font: fontBold });
    // Motivo se não resolvido
    if (formData.motivoNaoResolvido) {
      firstPage.drawText(formData.motivoNaoResolvido.substring(0, 35), { 
        x: 290, y: height - 634, size: smallFont, font 
      });
    }
  }
  
  // Haverá retorno - checkboxes
  if (formData.haveraRetorno === "sim") {
    firstPage.drawText("X", { x: 525, y: height - 634, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 543, y: height - 634, size: 8, font: fontBold });
  }
  
  // Horários e Data
  firstPage.drawText(formData.horaInicio, { x: 92, y: height - 651, size: fontSize, font });
  firstPage.drawText(formData.horaTermino, { x: 250, y: height - 651, size: fontSize, font });
  
  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  firstPage.drawText(dataFormatada, { x: 482, y: height - 651, size: fontSize, font });
  
  // CLIENTE - Dados na coluna esquerda
  firstPage.drawText(formData.clienteNome, { x: 97, y: height - 681, size: fontSize, font });
  firstPage.drawText(formData.clienteRgMatricula, { x: 132, y: height - 701, size: fontSize, font });
  firstPage.drawText(formData.clienteTelefone, { x: 97, y: height - 721, size: fontSize, font });
  
  // PRESTADOR - Dados na coluna direita
  firstPage.drawText(formData.prestadorNome, { x: 427, y: height - 681, size: fontSize, font });
  firstPage.drawText(formData.prestadorRgMatricula, { x: 462, y: height - 701, size: fontSize, font });
  firstPage.drawText(formData.prestadorTelefone, { x: 427, y: height - 721, size: fontSize, font });
  
  // Salvar e abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
