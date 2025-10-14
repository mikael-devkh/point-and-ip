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
  firstPage.drawText(formData.codigoLoja, { x: 265, y: height - 138, size: 10, font });
  // PDV
  firstPage.drawText(formData.pdv, { x: 545, y: height - 138, size: 10, font });
  // FSA
  firstPage.drawText(formData.fsa, { x: 685, y: height - 138, size: 10, font });
  // Endereço
  firstPage.drawText(formData.endereco, { x: 80, y: height - 164, size: 9, font });
  // Cidade
  firstPage.drawText(formData.cidade, { x: 545, y: height - 164, size: 9, font });
  // UF
  firstPage.drawText(formData.uf, { x: 775, y: height - 164, size: 9, font });
  // Nome do solicitante
  firstPage.drawText(formData.nomeSolicitante, { x: 55, y: height - 190, size: 9, font });
  
  // EQUIPAMENTOS ENVOLVIDOS - Checkboxes
  const equipmentPositions: { [key: string]: { x: number; y: number } } = {
    "01-PDV-Teclado": { x: 40, y: height - 234 },
    "02-PDV-Scanner": { x: 40, y: height - 246 },
    "03-PDV-Impressora": { x: 245, y: height - 234 },
    "04-PDV-Monitor": { x: 40, y: height - 258 },
    "05-PDV-Gaveta": { x: 40, y: height - 270 },
    "06-PDV-CPU": { x: 40, y: height - 282 },
    "07-Desktop-Gerente": { x: 245, y: height - 246 },
    "08-Desktop +Aqui": { x: 245, y: height - 258 },
    "09-Desktop-Almox.": { x: 245, y: height - 270 },
    "10-Desktop-Tesouraria": { x: 245, y: height - 282 },
    "11-Impressora-Zebra/Printronix": { x: 245, y: height - 294 },
    "12-Outros": { x: 245, y: height - 306 },
  };
  
  formData.equipamentos.forEach((equip) => {
    const pos = equipmentPositions[equip];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Dados do Equipamento - Coluna direita
  // Patrimônio
  firstPage.drawText(formData.patrimonioNumeroSerie, { x: 770, y: height - 234, size: 8, font });
  // Número Série ATIVO
  firstPage.drawText(formData.patrimonioNumeroSerie, { x: 470, y: height - 246, size: 8, font });
  // Equip. com defeito
  firstPage.drawText(formData.equipComDefeito, { x: 470, y: height - 258, size: 8, font });
  // Marca
  firstPage.drawText(formData.marca, { x: 455, y: height - 270, size: 8, font });
  // Modelo
  firstPage.drawText(formData.modelo, { x: 635, y: height - 270, size: 8, font });
  
  // Origem do equipamento - 3 linhas de checkboxes
  // Linha 1: E1, E2, E3, E4
  const origemY1 = height - 282;
  if (formData.origemEquipamento.includes("E1-Novo Delfia")) {
    firstPage.drawText("X", { x: 455, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E2-Novo Parceiro")) {
    firstPage.drawText("X", { x: 555, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E3-Recond. Delfia")) {
    firstPage.drawText("X", { x: 645, y: origemY1, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E4-Equip.Americanas")) {
    firstPage.drawText("X", { x: 745, y: origemY1, size: 7, font: fontBold });
  }
  
  // Linha 2: E5, E6, E7, E8
  const origemY2 = height - 294;
  if (formData.origemEquipamento.includes("E5-Peça-Delfia")) {
    firstPage.drawText("X", { x: 455, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E6-Peça-Parceiro")) {
    firstPage.drawText("X", { x: 545, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E7-Peça-Americanas")) {
    firstPage.drawText("X", { x: 665, y: origemY2, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E8-Garantia Schalter")) {
    firstPage.drawText("X", { x: 780, y: origemY2, size: 7, font: fontBold });
  }
  
  // Linha 3: E9, E10
  const origemY3 = height - 306;
  if (formData.origemEquipamento.includes("E9-Garantia Delfia")) {
    firstPage.drawText("X", { x: 455, y: origemY3, size: 7, font: fontBold });
  }
  if (formData.origemEquipamento.includes("E10-Garantia Parceiro")) {
    firstPage.drawText("X", { x: 555, y: origemY3, size: 7, font: fontBold });
  }
  
  // Dados da troca
  if (formData.numeroSerieTroca) {
    firstPage.drawText(formData.numeroSerieTroca, { x: 470, y: height - 318, size: 8, font });
    firstPage.drawText(formData.equipNovoRecond || "", { x: 470, y: height - 330, size: 8, font });
    firstPage.drawText(formData.marcaTroca, { x: 455, y: height - 342, size: 8, font });
    firstPage.drawText(formData.modeloTroca, { x: 635, y: height - 342, size: 8, font });
  }
  
  // PEÇAS/CABOS - Checkboxes em 2 colunas
  const pecasCabosPositions: { [key: string]: { x: number; y: number } } = {
    "13-CPU/Desktop-HD/SSD": { x: 40, y: height - 390 },
    "14-CPU/Desktop-Memória": { x: 40, y: height - 402 },
    "15-CPU/Desktop-Fonte Interna": { x: 40, y: height - 414 },
    "16-CPU/Desktop-Fonte Externa": { x: 40, y: height - 426 },
    "17-CPU/Desktop-Mother Board": { x: 40, y: height - 438 },
    "18-CPU/Desktop-Botão Power": { x: 40, y: height - 450 },
    "19-CPU/Desktop-Gabinete": { x: 40, y: height - 462 },
    "20-CPU/Desktop-Teclado ABNT": { x: 40, y: height - 474 },
    "21-CPU/Desktop-Bateria CMOS": { x: 40, y: height - 486 },
    "22-Imp-PDV-Fonte": { x: 40, y: height - 498 },
    "23-Imp-PDV-Placa Lógica": { x: 40, y: height - 510 },
    "24-Imp-PDV-Tampa": { x: 40, y: height - 522 },
    "25-Gaveta-Miolo": { x: 40, y: height - 534 },
    "26-Gaveta-Solenoide": { x: 218, y: height - 390 },
    "27-Gaveta-Miolo": { x: 218, y: height - 402 },
    "28-Gaveta-Chave": { x: 218, y: height - 414 },
    "29-Gaveta-Cabo RJ": { x: 218, y: height - 426 },
    "30-Monitor-Base": { x: 218, y: height - 438 },
    "31-Monitor-Fonte": { x: 218, y: height - 450 },
    "32-Cabo-Scanner": { x: 218, y: height - 462 },
    "33-Cabo-Teclado": { x: 218, y: height - 474 },
    "34-Cabo-Força": { x: 218, y: height - 486 },
    "35-Cabo-VGA/HDI": { x: 218, y: height - 498 },
    "36-Cabo-USB": { x: 218, y: height - 510 },
    "37-Cabo-Sata": { x: 218, y: height - 522 },
    "38-Outros": { x: 218, y: height - 534 },
  };
  
  formData.pecasCabos.forEach((peca) => {
    const pos = pecasCabosPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // PEÇAS IMPRESSORA - Checkboxes coluna direita
  const pecasImpressoraPositions: { [key: string]: { x: number; y: number } } = {
    "39-Cabeça Imp.": { x: 455, y: height - 390 },
    "40-Sup. Cabeça": { x: 455, y: height - 402 },
    "41-Platen": { x: 455, y: height - 414 },
    "42-Sensor Cabeça": { x: 455, y: height - 426 },
    "43-Sensor Etiqueta": { x: 455, y: height - 438 },
    "44-Placa Lógica": { x: 455, y: height - 450 },
    "45-Placa Fonte": { x: 455, y: height - 462 },
    "46-Fonte Externa": { x: 455, y: height - 474 },
    "47-Trava Cabeça": { x: 455, y: height - 486 },
    "48-Kit Engrenagens": { x: 455, y: height - 498 },
    "49-Correia": { x: 455, y: height - 510 },
    "50-Painel": { x: 455, y: height - 522 },
    "51-Print Server": { x: 455, y: height - 534 },
    "52-Outros": { x: 455, y: height - 546 },
  };
  
  formData.pecasImpressora.forEach((peca) => {
    const pos = pecasImpressoraPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 8, font: fontBold });
    }
  });
  
  // Mau uso checkboxes
  if (formData.mauUso === "sim") {
    firstPage.drawText("X", { x: 695, y: height - 390, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 740, y: height - 390, size: 8, font: fontBold });
  }
  
  // Observações peças - campo de texto
  if (formData.observacoesPecas) {
    const lines = formData.observacoesPecas.match(/.{1,25}/g) || [];
    lines.slice(0, 8).forEach((line, index) => {
      firstPage.drawText(line, { 
        x: 620, 
        y: height - 408 - (index * 10), 
        size: 7, 
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
    drawMultilineText(formData.defeitoProblema, 55, height - 582, 760, 2);
  }
  
  // Diagnóstico/Testes
  if (formData.diagnosticoTestes) {
    drawMultilineText(formData.diagnosticoTestes, 55, height - 622, 760, 5);
  }
  
  // Solução
  if (formData.solucao) {
    drawMultilineText(formData.solucao, 55, height - 690, 760, 5);
  }
  
  // Problema resolvido - checkboxes
  if (formData.problemaResolvido === "sim") {
    firstPage.drawText("X", { x: 125, y: height - 738, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 155, y: height - 738, size: 8, font: fontBold });
    // Motivo se não resolvido
    if (formData.motivoNaoResolvido) {
      firstPage.drawText(formData.motivoNaoResolvido.substring(0, 40), { 
        x: 280, y: height - 738, size: 7, font 
      });
    }
  }
  
  // Haverá retorno - checkboxes
  if (formData.haveraRetorno === "sim") {
    firstPage.drawText("X", { x: 730, y: height - 738, size: 8, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 760, y: height - 738, size: 8, font: fontBold });
  }
  
  // Horários e Data
  firstPage.drawText(formData.horaInicio, { x: 95, y: height - 755, size: 9, font });
  firstPage.drawText(formData.horaTermino, { x: 265, y: height - 755, size: 9, font });
  
  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  firstPage.drawText(dataFormatada, { x: 685, y: height - 755, size: 9, font });
  
  // CLIENTE - Dados na coluna esquerda
  firstPage.drawText(formData.clienteNome, { x: 120, y: height - 785, size: 9, font });
  firstPage.drawText(formData.clienteRgMatricula, { x: 145, y: height - 802, size: 9, font });
  firstPage.drawText(formData.clienteTelefone, { x: 95, y: height - 820, size: 9, font });
  
  // PRESTADOR - Dados na coluna direita
  firstPage.drawText(formData.prestadorNome, { x: 565, y: height - 785, size: 9, font });
  firstPage.drawText(formData.prestadorRgMatricula, { x: 565, y: height - 802, size: 9, font });
  firstPage.drawText(formData.prestadorTelefone, { x: 565, y: height - 820, size: 9, font });
  
  // Salvar e abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
