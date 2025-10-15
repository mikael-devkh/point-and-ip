import { PDFDocument } from "pdf-lib";
import ratTemplateUrl from "@/assets/rat-template.pdf?url";
import { RatFormData } from "@/types/rat";

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

// Helper para setar checkboxes
function setCheckSafe(form: any, fieldName: string, checked: boolean) {
  try { 
    const checkbox = form.getCheckBox(fieldName); 
    checked ? checkbox.check() : checkbox.uncheck(); 
    return; 
  } catch {}
  try { 
    form.getRadioGroup(fieldName).select(checked ? "on" : "off"); 
    return; 
  } catch {}
  try { 
    form.getTextField(fieldName).setText(checked ? "X" : ""); 
  } catch {}
}

// Helper para dividir texto em linhas
const splitLines = (text?: string, maxLines = 4) =>
  (text ?? "").split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, maxLines);

const normalizeHour = (hour?: string) => hour ? hour.replace(/\s+/g, "") : hour;

export const generateRatPDF = async (formData: RatFormData) => {
  try {
    log("Carregando template RAT...");
    const pdfBytes = await fetch(ratTemplateUrl).then((res) => res.arrayBuffer());
    
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    
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
    formData.equipamentos.forEach(equip => {
      // Tenta marcar o checkbox correspondente
      setCheckSafe(form, equip, true);
    });

    // DADOS DO EQUIPAMENTO
    setTextSafe(form, "Serial", formData.patrimonioNumeroSerie);
    setTextSafe(form, "Patrimonio", formData.patrimonioNumeroSerie);
    setTextSafe(form, "Marca", formData.marca);
    setTextSafe(form, "Modelo", formData.modelo);

    // ORIGEM DO EQUIPAMENTO
    if (formData.origemEquipamento === "primeiraDelfi") {
      setCheckSafe(form, "E1-Primeira-Delfi", true);
    } else if (formData.origemEquipamento === "provaParaleloPróprioDelfi") {
      setCheckSafe(form, "E2-Prova-Paralelo-Próp-Delfi", true);
    } else if (formData.origemEquipamento === "equipamentoProprioDelfi") {
      setCheckSafe(form, "E3-Equipamento-Próprio-Delfi", true);
    } else if (formData.origemEquipamento === "paraleloPróprioDelfi") {
      setCheckSafe(form, "E4-Paralelo-Próp-Delfi", true);
    }

    // DADOS DA TROCA
    if (formData.numeroSerieTroca) {
      setTextSafe(form, "Número Série Troca", formData.numeroSerieTroca);
      setTextSafe(form, "Equip. Novo/Recond.", formData.equipNovoRecond);
      setTextSafe(form, "Marca2", formData.marcaTroca);
      setTextSafe(form, "Modelo2", formData.modeloTroca);
    }

    // PEÇAS/CABOS
    const pecasCabosLines = splitLines(formData.pecasCabos?.join(", ") || "", 3);
    setTextSafe(form, "Row1", pecasCabosLines[0]);
    setTextSafe(form, "Row2", pecasCabosLines[1]);
    setTextSafe(form, "Row3", pecasCabosLines[2]);

    // PEÇAS IMPRESSORA
    const pecasImpressoraLines = splitLines(formData.pecasImpressora?.join(", ") || "", 3);
    setTextSafe(form, "RowImp1", pecasImpressoraLines[0]);
    setTextSafe(form, "RowImp2", pecasImpressoraLines[1]);
    setTextSafe(form, "RowImp3", pecasImpressoraLines[2]);

    // MAU USO
    setCheckSafe(form, "Sim", formData.mauUso === "sim");
    setCheckSafe(form, "Não", formData.mauUso === "nao");

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
    setCheckSafe(form, "SimProblemaresolvido", formData.problemaResolvido === "sim");
    setCheckSafe(form, "NãoProblemaresolvido", formData.problemaResolvido === "nao");
    if (formData.problemaResolvido === "nao") {
      setTextSafe(form, "Motivo", formData.motivoNaoResolvido);
    }

    // HAVERÁ RETORNO
    setCheckSafe(form, "SimHaveráretorno", formData.haveraRetorno === "sim");
    setCheckSafe(form, "NãoHaveráretorno", formData.haveraRetorno === "nao");

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
