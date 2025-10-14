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
  firstPage.drawText(formData.codigoLoja, { x: 300, y: height - 100, size: fontSize, font });
  // PDV
  firstPage.drawText(formData.pdv, { x: 423, y: height - 100, size: fontSize, font });
  // FSA
  firstPage.drawText(formData.fsa, { x: 490, y: height - 100, size: fontSize, font });
  // Endereço
  firstPage.drawText(formData.endereco, { x: 118, y: height - 117, size: fontSize, font });
  // Cidade
  firstPage.drawText(formData.cidade, { x: 400, y: height - 117, size: fontSize, font });
  // UF
  firstPage.drawText(formData.uf, { x: 580, y: height - 117, size: fontSize, font });
  // Nome do solicitante
  firstPage.drawText(formData.nomeSolicitante, { x: 138, y: height - 133, size: fontSize, font });
  
  // EQUIPAMENTOS ENVOLVIDOS - Checkboxes
  const equipmentPositions: { [key: string]: { x: number; y: number } } = {
    "01-PDV-Teclado": { x: 56, y: height - 169 },
    "02-PDV-Scanner": { x: 56, y: height - 178 },
    "03-PDV-Impressora": { x: 56, y: height - 187 },
    "04-PDV-Monitor": { x: 56, y: height - 196 },
    "05-PDV-Gaveta": { x: 56, y: height - 205 },
    "06-PDV-CPU": { x: 56, y: height - 214 },
    "07-Desktop-Gerente": { x: 210, y: height - 169 },
    "08-Desktop +Aqui": { x: 210, y: height - 178 },
    "09-Desktop-Almox.": { x: 210, y: height - 187 },
    "10-Desktop-Tesouraria": { x: 210, y: height - 196 },
    "11-Impressora-Zebra/Printronix": { x: 210, y: height - 205 },
    "12-Outros": { x: 210, y: height - 214 },
  };
  
  formData.equipamentos.forEach((equip) => {
    const pos = equipmentPositions[equip];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Dados do Equipamento - Coluna direita
  // Número Série ATIVO
  firstPage.drawText(formData.patrimonioNumeroSerie, { x: 380, y: height - 180, size: smallFont, font });
  // Equip. com defeito
  firstPage.drawText(formData.equipComDefeito, { x: 380, y: height - 189, size: smallFont, font });
  // Marca
  firstPage.drawText(formData.marca, { x: 300, y: height - 205, size: smallFont, font });
  // Modelo
  firstPage.drawText(formData.modelo, { x: 440, y: height - 205, size: smallFont, font });
  
  // Origem do equipamento - 3 linhas de checkboxes
  // Linha 1: E1, E2, E3, E4
  const origemY1 = height - 222;
  if (formData.origemEquipamento.includes("E1-Novo Delfia")) {
    firstPage.drawText("X", { x: 300, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E2-Novo Parceiro")) {
    firstPage.drawText("X", { x: 386, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E3-Recond. Delfia")) {
    firstPage.drawText("X", { x: 445, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E4-Equip.Americanas")) {
    firstPage.drawText("X", { x: 520, y: origemY1, size: 7, font: fontBold });
  }
  
  // Linha 2: E5, E6, E7, E8
  const origemY2 = height - 231;
  if (formData.origemEquipamento.includes("E5-Peça-Delfia")) {
    firstPage.drawText("X", { x: 300, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E6-Peça-Parceiro")) {
    firstPage.drawText("X", { x: 386, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E7-Peça-Americanas")) {
    firstPage.drawText("X", { x: 490, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E8-Garantia Schalter")) {
    firstPage.drawText("X", { x: 300, y: height - 240, size: 7, font: fontBold });
  }
  
  // Linha 3: E9, E10
  const origemY3 = height - 240;
  if (formData.origemEquipamento.includes("E9-Garantia Delfia")) {
    firstPage.drawText("X", { x: 386, y: origemY3, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E10-Garantia Parceiro")) {
    firstPage.drawText("X", { x: 460, y: origemY3, size: 7, font: fontBold });
  }
  
  // Dados da troca
  if (formData.numeroSerieTroca) {
    firstPage.drawText(formData.numeroSerieTroca, { x: 380, y: height - 252, size: smallFont, font });
    firstPage.drawText(formData.equipNovoRecond || "", { x: 300, y: height - 261, size: smallFont, font });
    firstPage.drawText(formData.marcaTroca, { x: 300, y: height - 271, size: smallFont, font });
    firstPage.drawText(formData.modeloTroca, { x: 440, y: height - 271, size: smallFont, font });
  }
  
  // PEÇAS/CABOS - Checkboxes em 2 colunas
  const pecasCabosPositions: { [key: string]: { x: number; y: number } } = {
    "13-CPU/Desktop-HD/SSD": { x: 56, y: height - 310 },
    "14-CPU/Desktop-Memória": { x: 56, y: height - 319 },
    "15-CPU/Desktop-Fonte Interna": { x: 56, y: height - 328 },
    "16-CPU/Desktop-Fonte Externa": { x: 56, y: height - 337 },
    "17-CPU/Desktop-Mother Board": { x: 56, y: height - 346 },
    "18-CPU/Desktop-Botão Power": { x: 56, y: height - 355 },
    "19-CPU/Desktop-Gabinete": { x: 56, y: height - 364 },
    "20-CPU/Desktop-Teclado ABNT": { x: 56, y: height - 373 },
    "21-CPU/Desktop-Bateria CMOS": { x: 56, y: height - 382 },
    "22-Imp-PDV-Fonte": { x: 56, y: height - 391 },
    "23-Imp-PDV-Placa Lógica": { x: 56, y: height - 400 },
    "24-Imp-PDV-Tampa": { x: 56, y: height - 409 },
    "25-Gaveta-Miolo": { x: 56, y: height - 418 },
    "26-Gaveta-Solenoide": { x: 190, y: height - 310 },
    "27-Gaveta-Miolo": { x: 190, y: height - 319 },
    "28-Gaveta-Chave": { x: 190, y: height - 328 },
    "29-Gaveta-Cabo RJ": { x: 190, y: height - 337 },
    "30-Monitor-Base": { x: 190, y: height - 346 },
    "31-Monitor-Fonte": { x: 190, y: height - 355 },
    "32-Cabo-Scanner": { x: 190, y: height - 364 },
    "33-Cabo-Teclado": { x: 190, y: height - 373 },
    "34-Cabo-Força": { x: 190, y: height - 382 },
    "35-Cabo-VGA/HDI": { x: 190, y: height - 391 },
    "36-Cabo-USB": { x: 190, y: height - 400 },
    "37-Cabo-Sata": { x: 190, y: height - 409 },
  };
  
  formData.pecasCabos.forEach((peca) => {
    const pos = pecasCabosPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // PEÇAS IMPRESSORA - Checkboxes coluna direita
  const pecasImpressoraPositions: { [key: string]: { x: number; y: number } } = {
    "39-Cabeça Imp.": { x: 325, y: height - 310 },
    "40-Sup. Cabeça": { x: 325, y: height - 319 },
    "41-Platen": { x: 325, y: height - 328 },
    "42-Sensor Cabeça": { x: 325, y: height - 337 },
    "43-Sensor Etiqueta": { x: 325, y: height - 346 },
    "44-Placa Lógica": { x: 325, y: height - 355 },
    "45-Placa Fonte": { x: 325, y: height - 364 },
    "46-Fonte Externa": { x: 325, y: height - 373 },
    "47-Trava Cabeça": { x: 325, y: height - 382 },
    "48-Kit Engrenagens": { x: 325, y: height - 391 },
    "49-Correia": { x: 325, y: height - 400 },
    "50-Painel": { x: 325, y: height - 409 },
    "51-Print Server": { x: 325, y: height - 418 },
  };
  
  formData.pecasImpressora.forEach((peca) => {
    const pos = pecasImpressoraPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Mau uso checkboxes
  if (formData.mauUso === "sim") {
    firstPage.drawText("X", { x: 520, y: height - 310, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 560, y: height - 310, size: 8, font: fontBold });
  }
  
  // Observações peças - campo de texto
  if (formData.observacoesPecas) {
    const lines = formData.observacoesPecas.match(/.{1,30}/g) || [];
    lines.slice(0, 5).forEach((line, index) => {
      firstPage.drawText(line, { 
        x: 470, 
        y: height - 328 - (index * 9), 
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
    drawMultilineText(formData.defeitoProblema, 56, height - 454, 540, 2);
  }
  
  // Diagnóstico/Testes
  if (formData.diagnosticoTestes) {
    drawMultilineText(formData.diagnosticoTestes, 56, height - 495, 540, 5);
  }
  
  // Solução
  if (formData.solucao) {
    drawMultilineText(formData.solucao, 56, height - 565, 540, 5);
  }
  
  // Problema resolvido - checkboxes
  if (formData.problemaResolvido === "sim") {
    firstPage.drawText("X", { x: 156, y: height - 622, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 178, y: height - 622, size: 8, font: fontBold });
    // Motivo se não resolvido
    if (formData.motivoNaoResolvido) {
      firstPage.drawText(formData.motivoNaoResolvido.substring(0, 25), { 
        x: 260, y: height - 622, size: smallFont, font 
      });
    }
  }
  
  // Haverá retorno - checkboxes
  if (formData.haveraRetorno === "sim") {
    firstPage.drawText("X", { x: 565, y: height - 622, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 586, y: height - 622, size: 8, font: fontBold });
  }
  
  // Horários e Data
  firstPage.drawText(formData.horaInicio, { x: 135, y: height - 639, size: fontSize, font });
  firstPage.drawText(formData.horaTermino, { x: 250, y: height - 639, size: fontSize, font });
  
  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  firstPage.drawText(dataFormatada, { x: 530, y: height - 639, size: fontSize, font });
  
  // CLIENTE - Dados na coluna esquerda
  firstPage.drawText(formData.clienteNome, { x: 155, y: height - 672, size: fontSize, font });
  firstPage.drawText(formData.clienteRgMatricula, { x: 245, y: height - 690, size: fontSize, font });
  firstPage.drawText(formData.clienteTelefone, { x: 155, y: height - 708, size: fontSize, font });
  
  // PRESTADOR - Dados na coluna direita
  firstPage.drawText(formData.prestadorNome, { x: 485, y: height - 672, size: fontSize, font });
  firstPage.drawText(formData.prestadorRgMatricula, { x: 545, y: height - 690, size: fontSize, font });
  firstPage.drawText(formData.prestadorTelefone, { x: 485, y: height - 708, size: fontSize, font });
  
  // Salvar e abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
