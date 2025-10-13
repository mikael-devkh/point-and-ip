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
  const smallFont = 8;
  
  // IDENTIFICAÇÃO
  firstPage.drawText(formData.codigoLoja, { x: 260, y: height - 115, size: fontSize, font });
  firstPage.drawText(formData.pdv, { x: 390, y: height - 115, size: fontSize, font });
  firstPage.drawText(formData.fsa, { x: 510, y: height - 115, size: fontSize, font });
  firstPage.drawText(formData.endereco, { x: 90, y: height - 133, size: fontSize, font });
  firstPage.drawText(formData.cidade, { x: 380, y: height - 133, size: fontSize, font });
  firstPage.drawText(formData.uf, { x: 560, y: height - 133, size: fontSize, font });
  firstPage.drawText(formData.nomeSolicitante, { x: 50, y: height - 151, size: fontSize, font });
  
  // EQUIPAMENTOS ENVOLVIDOS - Marcar checkboxes dos equipamentos
  const equipmentPositions: { [key: string]: { x: number; y: number } } = {
    "01-PDV-Teclado": { x: 49, y: height - 189 },
    "02-PDV-Scanner": { x: 49, y: height - 199 },
    "03-PDV-Impressora": { x: 49, y: height - 209 },
    "04-PDV-Monitor": { x: 49, y: height - 219 },
    "05-PDV-Gaveta": { x: 49, y: height - 229 },
    "06-PDV-CPU": { x: 49, y: height - 239 },
    "07-Desktop-Gerente": { x: 245, y: height - 189 },
    "08-Desktop +Aqui": { x: 245, y: height - 199 },
    "09-Desktop-Almox.": { x: 245, y: height - 209 },
    "10-Desktop-Tesouraria": { x: 245, y: height - 219 },
    "11-Impressora-Zebra/Printronix": { x: 245, y: height - 229 },
    "12-Outros": { x: 245, y: height - 239 },
  };
  
  formData.equipamentos.forEach((equip) => {
    const pos = equipmentPositions[equip];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 10, font: fontBold });
    }
  });
  
  // Dados do Equipamento
  firstPage.drawText(formData.patrimonioNumeroSerie, { x: 450, y: height - 189, size: smallFont, font });
  firstPage.drawText(formData.equipComDefeito, { x: 450, y: height - 199, size: smallFont, font });
  firstPage.drawText(formData.marca, { x: 450, y: height - 219, size: smallFont, font });
  firstPage.drawText(formData.modelo, { x: 520, y: height - 219, size: smallFont, font });
  
  // Origem do equipamento - checkbox
  const origemPositions: { [key: string]: { x: number; y: number } } = {
    "E1-Novo Delfia": { x: 355, y: height - 241 },
    "E2-Novo Parceiro": { x: 422, y: height - 241 },
    "E3-Recond. Delfia": { x: 490, y: height - 241 },
    "E4-Equip.Americanas": { x: 355, y: height - 251 },
    "E5-Peça-Delfia": { x: 355, y: height - 251 },
    "E6-Peça-Parceiro": { x: 422, y: height - 251 },
    "E7-Peça-Americanas": { x: 490, y: height - 251 },
    "E8-Garantia Schalter": { x: 355, y: height - 261 },
    "E9-Garantia Delfia": { x: 355, y: height - 271 },
    "E10-Garantia Parceiro": { x: 422, y: height - 271 },
  };
  
  const origemPos = origemPositions[formData.origemEquipamento];
  if (origemPos) {
    firstPage.drawText("X", { x: origemPos.x, y: origemPos.y, size: 9, font: fontBold });
  }
  
  // Dados da troca
  if (formData.numeroSerieTroca) {
    firstPage.drawText(formData.numeroSerieTroca, { x: 130, y: height - 283, size: smallFont, font });
    firstPage.drawText(formData.equipNovoRecond || "", { x: 290, y: height - 283, size: smallFont, font });
    firstPage.drawText(formData.marcaTroca, { x: 130, y: height - 293, size: smallFont, font });
    firstPage.drawText(formData.modeloTroca, { x: 290, y: height - 293, size: smallFont, font });
  }
  
  // PEÇAS/CABOS - Marcar checkboxes
  const pecasCabosPositions: { [key: string]: { x: number; y: number } } = {
    "13-CPU/Desktop-HD/SSD": { x: 49, y: height - 327 },
    "14-CPU/Desktop-Memória": { x: 49, y: height - 337 },
    "15-CPU/Desktop-Fonte Interna": { x: 49, y: height - 347 },
    "16-CPU/Desktop-Fonte Externa": { x: 49, y: height - 357 },
    "17-CPU/Desktop-Mother Board": { x: 49, y: height - 367 },
    "18-CPU/Desktop-Botão Power": { x: 49, y: height - 377 },
    "19-CPU/Desktop-Gabinete": { x: 49, y: height - 387 },
    "20-CPU/Desktop-Teclado ABNT": { x: 49, y: height - 397 },
    "21-CPU/Desktop-Bateria CMOS": { x: 49, y: height - 407 },
    "22-Imp-PDV-Fonte": { x: 49, y: height - 417 },
    "23-Imp-PDV-Placa Lógica": { x: 49, y: height - 427 },
    "24-Imp-PDV-Tampa": { x: 49, y: height - 437 },
    "25-Gaveta-Miolo": { x: 49, y: height - 447 },
    "26-Gaveta-Solenoide": { x: 245, y: height - 327 },
    "27-Gaveta-Miolo": { x: 245, y: height - 337 },
    "28-Gaveta-Chave": { x: 245, y: height - 347 },
    "29-Gaveta-Cabo RJ": { x: 245, y: height - 357 },
    "30-Monitor-Base": { x: 245, y: height - 367 },
    "31-Monitor-Fonte": { x: 245, y: height - 377 },
    "32-Cabo-Scanner": { x: 245, y: height - 387 },
    "33-Cabo-Teclado": { x: 245, y: height - 397 },
    "34-Cabo-Força": { x: 245, y: height - 407 },
    "35-Cabo-VGA/HDI": { x: 245, y: height - 417 },
    "36-Cabo-USB": { x: 245, y: height - 427 },
    "37-Cabo-Sata": { x: 245, y: height - 437 },
  };
  
  formData.pecasCabos.forEach((peca) => {
    const pos = pecasCabosPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 9, font: fontBold });
    }
  });
  
  // PEÇAS IMPRESSORA - Marcar checkboxes
  const pecasImpressoraPositions: { [key: string]: { x: number; y: number } } = {
    "39-Cabeça Imp.": { x: 420, y: height - 327 },
    "40-Sup. Cabeça": { x: 420, y: height - 337 },
    "41-Platen": { x: 420, y: height - 347 },
    "42-Sensor Cabeça": { x: 420, y: height - 357 },
    "43-Sensor Etiqueta": { x: 420, y: height - 367 },
    "44-Placa Lógica": { x: 420, y: height - 377 },
    "45-Placa Fonte": { x: 420, y: height - 387 },
    "46-Fonte Externa": { x: 420, y: height - 397 },
    "47-Trava Cabeça": { x: 420, y: height - 407 },
    "48-Kit Engrenagens": { x: 420, y: height - 417 },
    "49-Correia": { x: 420, y: height - 427 },
    "50-Painel": { x: 420, y: height - 437 },
    "51-Print Server": { x: 420, y: height - 447 },
  };
  
  formData.pecasImpressora.forEach((peca) => {
    const pos = pecasImpressoraPositions[peca];
    if (pos) {
      firstPage.drawText("X", { x: pos.x, y: pos.y, size: 9, font: fontBold });
    }
  });
  
  // Mau uso checkbox
  if (formData.mauUso === "sim") {
    firstPage.drawText("X", { x: 549, y: height - 327, size: 9, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 567, y: height - 327, size: 9, font: fontBold });
  }
  
  // Observações peças
  if (formData.observacoesPecas) {
    firstPage.drawText(formData.observacoesPecas.substring(0, 80), { 
      x: 455, y: height - 347, size: smallFont, font 
    });
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
    drawMultilineText(formData.defeitoProblema, 50, height - 485, 520, 10);
  }
  
  // Diagnóstico/Testes
  if (formData.diagnosticoTestes) {
    drawMultilineText(formData.diagnosticoTestes, 50, height - 535, 520, 10);
  }
  
  // Solução
  if (formData.solucao) {
    drawMultilineText(formData.solucao, 50, height - 605, 520, 10);
  }
  
  // Problema resolvido
  if (formData.problemaResolvido === "sim") {
    firstPage.drawText("X", { x: 203, y: height - 648, size: 9, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 220, y: height - 648, size: 9, font: fontBold });
    if (formData.motivoNaoResolvido) {
      firstPage.drawText(formData.motivoNaoResolvido.substring(0, 50), { 
        x: 280, y: height - 648, size: smallFont, font 
      });
    }
  }
  
  // Haverá retorno
  if (formData.haveraRetorno === "sim") {
    firstPage.drawText("X", { x: 535, y: height - 648, size: 9, font: fontBold });
  } else {
    firstPage.drawText("X", { x: 555, y: height - 648, size: 9, font: fontBold });
  }
  
  // Horários e Data
  firstPage.drawText(formData.horaInicio, { x: 100, y: height - 665, size: fontSize, font });
  firstPage.drawText(formData.horaTermino, { x: 253, y: height - 665, size: fontSize, font });
  
  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  firstPage.drawText(dataFormatada, { x: 485, y: height - 665, size: fontSize, font });
  
  // CLIENTE
  firstPage.drawText(formData.clienteNome, { x: 120, y: height - 695, size: fontSize, font });
  firstPage.drawText(formData.clienteRgMatricula, { x: 120, y: height - 715, size: fontSize, font });
  firstPage.drawText(formData.clienteTelefone, { x: 120, y: height - 735, size: fontSize, font });
  
  // PRESTADOR
  firstPage.drawText(formData.prestadorNome, { x: 450, y: height - 695, size: fontSize, font });
  firstPage.drawText(formData.prestadorRgMatricula, { x: 450, y: height - 715, size: fontSize, font });
  firstPage.drawText(formData.prestadorTelefone, { x: 450, y: height - 735, size: fontSize, font });
  
  // Salvar e abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
