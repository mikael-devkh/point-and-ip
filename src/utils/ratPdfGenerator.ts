import { jsPDF } from "jspdf";

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

export const generateRatPDF = (formData: RatFormData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;

  // Função auxiliar para adicionar texto com quebra de linha
  const addText = (text: string, x: number, y: number, maxWidth?: number) => {
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * 5;
    } else {
      doc.text(text, x, y);
      return 5;
    }
  };

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE ATENDIMENTO TÉCNICO - RAT", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Seção Identificação
  doc.setFont("helvetica", "bold");
  doc.text("IDENTIFICAÇÃO", 15, yPosition);
  yPosition += 6;
  doc.setFont("helvetica", "normal");

  addText(`Cliente: LOJAS AMERICANAS`, 15, yPosition);
  yPosition += 5;
  addText(`Código da Loja: ${formData.codigoLoja}    PDV: ${formData.pdv}    FSA: ${formData.fsa}`, 15, yPosition);
  yPosition += 5;
  addText(`Endereço: ${formData.endereco}`, 15, yPosition);
  yPosition += 5;
  addText(`Cidade: ${formData.cidade}    UF: ${formData.uf}`, 15, yPosition);
  yPosition += 5;
  addText(`Nome do solicitante: ${formData.nomeSolicitante}`, 15, yPosition);
  yPosition += 8;

  // Seção Equipamentos Envolvidos
  doc.setFont("helvetica", "bold");
  doc.text("EQUIPAMENTOS ENVOLVIDOS", 15, yPosition);
  yPosition += 6;
  doc.setFont("helvetica", "normal");

  if (formData.equipamentos.length > 0) {
    addText(`Equipamentos: ${formData.equipamentos.join(", ")}`, 15, yPosition, pageWidth - 30);
    yPosition += Math.ceil(formData.equipamentos.join(", ").length / 80) * 5 + 3;
  }

  addText(`Patrimônio/Número Série: ${formData.patrimonioNumeroSerie}`, 15, yPosition);
  yPosition += 5;
  addText(`Equip. com defeito: ${formData.equipComDefeito}`, 15, yPosition);
  yPosition += 5;
  addText(`Marca: ${formData.marca}    Modelo: ${formData.modelo}`, 15, yPosition);
  yPosition += 5;
  addText(`Origem: ${formData.origemEquipamento}`, 15, yPosition);
  yPosition += 5;

  if (formData.numeroSerieTroca) {
    addText(`Troca - Número Série: ${formData.numeroSerieTroca}`, 15, yPosition);
    yPosition += 5;
    addText(`Marca: ${formData.marcaTroca}    Modelo: ${formData.modeloTroca}`, 15, yPosition);
    yPosition += 5;
  }
  yPosition += 3;

  // Seção Peças/Cabos
  if (formData.pecasCabos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("PEÇAS/CABOS", 15, yPosition);
    yPosition += 6;
    doc.setFont("helvetica", "normal");
    
    addText(formData.pecasCabos.join(", "), 15, yPosition, pageWidth - 30);
    yPosition += Math.ceil(formData.pecasCabos.join(", ").length / 80) * 5 + 6;
  }

  // Seção Peças Impressora
  if (formData.pecasImpressora.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("PEÇAS IMP. TÉRMICA", 15, yPosition);
    yPosition += 6;
    doc.setFont("helvetica", "normal");
    
    addText(formData.pecasImpressora.join(", "), 15, yPosition, pageWidth - 30);
    yPosition += Math.ceil(formData.pecasImpressora.join(", ").length / 80) * 5 + 3;
    addText(`Mau uso: ${formData.mauUso === "sim" ? "Sim" : "Não"}`, 15, yPosition);
    yPosition += 5;
    if (formData.observacoesPecas) {
      yPosition += addText(`Observações: ${formData.observacoesPecas}`, 15, yPosition, pageWidth - 30);
    }
    yPosition += 3;
  }

  // Verificar se precisa de nova página
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 15;
  }

  // Seção Laudo Técnico
  doc.setFont("helvetica", "bold");
  doc.text("CONSIDERAÇÕES GERAIS – LAUDO TÉCNICO", 15, yPosition);
  yPosition += 6;
  doc.setFont("helvetica", "normal");

  doc.setFont("helvetica", "bold");
  addText("Defeito/Problema:", 15, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  yPosition += addText(formData.defeitoProblema || "N/A", 15, yPosition, pageWidth - 30);

  doc.setFont("helvetica", "bold");
  addText("Diagnóstico/Testes realizados:", 15, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  yPosition += addText(formData.diagnosticoTestes || "N/A", 15, yPosition, pageWidth - 30);

  doc.setFont("helvetica", "bold");
  addText("Solução:", 15, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  yPosition += addText(formData.solucao || "N/A", 15, yPosition, pageWidth - 30);

  addText(`Problema resolvido? ${formData.problemaResolvido === "sim" ? "Sim" : "Não"}`, 15, yPosition);
  yPosition += 5;

  if (formData.problemaResolvido === "nao" && formData.motivoNaoResolvido) {
    addText(`Motivo: ${formData.motivoNaoResolvido}`, 15, yPosition, pageWidth - 30);
    yPosition += 5;
  }

  addText(`Haverá retorno? ${formData.haveraRetorno === "sim" ? "Sim" : "Não"}`, 15, yPosition);
  yPosition += 8;

  // Horários e Data
  const dataFormatada = formData.data ? new Date(formData.data).toLocaleDateString("pt-BR") : "";
  addText(`Hora início: ${formData.horaInicio}    Hora término: ${formData.horaTermino}    Data: ${dataFormatada}`, 15, yPosition);
  yPosition += 10;

  // Dados Cliente e Prestador
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE", 15, yPosition);
  doc.text("PRESTADOR", pageWidth / 2 + 10, yPosition);
  yPosition += 6;
  doc.setFont("helvetica", "normal");

  addText(`Nome: ${formData.clienteNome}`, 15, yPosition);
  addText(`Nome: ${formData.prestadorNome}`, pageWidth / 2 + 10, yPosition);
  yPosition += 5;

  addText(`RG/Matrícula: ${formData.clienteRgMatricula}`, 15, yPosition);
  addText(`RG/Matrícula: ${formData.prestadorRgMatricula}`, pageWidth / 2 + 10, yPosition);
  yPosition += 5;

  addText(`Telefone: ${formData.clienteTelefone}`, 15, yPosition);
  addText(`Telefone: ${formData.prestadorTelefone}`, pageWidth / 2 + 10, yPosition);
  yPosition += 15;

  // Assinaturas
  doc.line(15, yPosition, 85, yPosition);
  doc.line(pageWidth / 2 + 10, yPosition, pageWidth - 15, yPosition);
  yPosition += 5;
  doc.setFontSize(8);
  doc.text("Assinatura e Carimbo Cliente", 15, yPosition);
  doc.text("Assinatura Prestador", pageWidth / 2 + 10, yPosition);

  // Rodapé
  doc.setFontSize(8);
  doc.text("Relatório Prestador de Serviços - Versão 2.4", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
    align: "center",
  });

  // Abrir janela de impressão
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
};
