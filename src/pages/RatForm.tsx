import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/Navigation";
import { RatHistoryList, RatHistoryEntry } from "@/components/RatHistoryList";
import { FileText, Printer, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateRatPDF } from "@/utils/ratPdfGenerator";
import { RatFormData } from "@/types/rat";
import {
  cloneRatFormData,
  createEmptyRatFormData,
  equipamentoOptions,
  origemEquipamentoOptions,
  pecasCabosOptions,
  pecasImpressoraOptions,
  sampleRatFormData,
} from "@/data/ratOptions";

const COMMON_PROBLEMS = [
  "Não liga",
  "Papel encravado",
  "Ecrã azul",
  "Não dá imagem",
  "Lentidão excessiva",
];

const extractCommonProblems = (text: string) => {
  const normalizedLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return COMMON_PROBLEMS.filter((problem) => normalizedLines.includes(`- ${problem}`));
};

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const RAT_HISTORY_STORAGE_KEY = "ratHistory";

const RatForm = () => {
  const [formData, setFormData] = useState<RatFormData>(() => createEmptyRatFormData());
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [ratHistory, setRatHistory] = useState<RatHistoryEntry[]>([]);

  const toggleListValue = (list: string[], value: string, checked: boolean) => {
    if (checked) {
      return Array.from(new Set([...list, value]));
    }
    return list.filter((item) => item !== value);
  };

  const buildCheckboxId = (prefix: string, value: string) =>
    `${prefix}-${value}`.replace(/[^a-zA-Z0-9-_]/g, "-");

  const handleUseSampleData = () => {
    const sampleData = cloneRatFormData(sampleRatFormData);
    setFormData(sampleData);
    setSelectedProblems(extractCommonProblems(sampleData.defeitoProblema));
    toast.success("Formulário preenchido com dados de teste.");
  };

  const handleResetForm = () => {
    setFormData(createEmptyRatFormData());
    setSelectedProblems([]);
    toast.info("Formulário limpo.");
  };

  const handleCommonProblemToggle = (problem: string, isChecked: boolean) => {
    setSelectedProblems((prev) => {
      if (isChecked) {
        if (prev.includes(problem)) {
          return prev;
        }
        const updated = [...prev, problem];
        return COMMON_PROBLEMS.filter((item) => updated.includes(item));
      }
      const remaining = prev.filter((item) => item !== problem);
      return COMMON_PROBLEMS.filter((item) => remaining.includes(item));
    });

    setFormData((prev) => {
      const bullet = `- ${problem}`;
      const lines = prev.defeitoProblema ? prev.defeitoProblema.split("\n") : [];

      if (isChecked) {
        if (lines.some((line) => line.trim() === bullet)) {
          return prev;
        }

        const trimmed = prev.defeitoProblema.trimEnd();
        const nextText = trimmed ? `${trimmed}\n${bullet}` : bullet;
        return { ...prev, defeitoProblema: nextText };
      }

      const filtered = lines.filter((line) => line.trim() !== bullet);
      const updated = filtered.join("\n").trim();
      return { ...prev, defeitoProblema: updated };
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = localStorage.getItem(RAT_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed: RatHistoryEntry[] = JSON.parse(stored);
        setRatHistory(parsed);
      }
    } catch (error) {
      console.error("Não foi possível carregar o histórico de RAT:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (ratHistory.length === 0) {
      localStorage.removeItem(RAT_HISTORY_STORAGE_KEY);
      return;
    }

    try {
      localStorage.setItem(RAT_HISTORY_STORAGE_KEY, JSON.stringify(ratHistory));
    } catch (error) {
      console.error("Não foi possível salvar o histórico de RAT:", error);
    }
  }, [ratHistory]);

  useEffect(() => {
    const derivedProblems = extractCommonProblems(formData.defeitoProblema);
    setSelectedProblems((prev) => (arraysEqual(prev, derivedProblems) ? prev : derivedProblems));
  }, [formData.defeitoProblema]);

  const handleGeneratePDF = async () => {
    try {
      await generateRatPDF(formData);
      setRatHistory((previous) => {
        const entry: RatHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          fsa: formData.fsa?.trim() || undefined,
          codigoLoja: formData.codigoLoja?.trim() || undefined,
          pdv: formData.pdv?.trim() || undefined,
          defeitoProblema: formData.defeitoProblema?.trim() || undefined,
          formData: cloneRatFormData(formData),
        };

        const nextHistory = [entry, ...previous];
        return nextHistory.slice(0, 30);
      });
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  const handleRatHistorySelect = (entry: RatHistoryEntry) => {
    const restored = cloneRatFormData(entry.formData);
    setFormData(restored);
    toast.info("Dados da RAT carregados do histórico.");
  };

  const handleRatHistoryClear = () => {
    setRatHistory([]);
    toast.info("Histórico de RAT limpo.");
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-primary px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-secondary rounded-2xl shadow-glow">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Relatório de Atendimento Técnico - RAT
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados para gerar a RAT
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="p-6 space-y-8">
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleResetForm}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpar formulário
                </Button>
                <Button type="button" variant="secondary" onClick={handleUseSampleData}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Preencher com exemplo
                </Button>
              </div>

          {/* Identificação */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              Identificação
            </h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigoLoja">Código da Loja</Label>
                <Input
                  id="codigoLoja"
                  value={formData.codigoLoja}
                  onChange={(e) => setFormData({ ...formData, codigoLoja: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdv">PDV</Label>
                <Input
                  id="pdv"
                  value={formData.pdv}
                  onChange={(e) => setFormData({ ...formData, pdv: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fsa">FSA</Label>
                <Input
                  id="fsa"
                  value={formData.fsa}
                  onChange={(e) => setFormData({ ...formData, fsa: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  maxLength={2}
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeSolicitante">Nome do Solicitante</Label>
              <Input
                id="nomeSolicitante"
                value={formData.nomeSolicitante}
                onChange={(e) => setFormData({ ...formData, nomeSolicitante: e.target.value })}
              />
            </div>
          </section>

          {/* Dados do Equipamento */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Dados do Equipamento</h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="serial">Número Série ATIVO</Label>
                <Input
                  id="serial"
                  value={formData.serial}
                  onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patrimonio">Patrimônio</Label>
                <Input
                  id="patrimonio"
                  value={formData.patrimonio}
                  onChange={(e) => setFormData({ ...formData, patrimonio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Origem do Equipamento</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {origemEquipamentoOptions.map((origem) => {
                  const checkboxId = buildCheckboxId("origem", origem.value);
                  return (
                    <div key={origem.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={checkboxId}
                        checked={formData.origemEquipamento === origem.value}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            origemEquipamento: checked ? origem.value : "",
                          })
                        }
                      />
                      <label htmlFor={checkboxId} className="text-sm cursor-pointer">
                        {origem.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroSerieTroca">Número Série Troca</Label>
                <Input
                  id="numeroSerieTroca"
                  value={formData.numeroSerieTroca}
                  onChange={(e) => setFormData({ ...formData, numeroSerieTroca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipNovoRecond">Equip. Novo/Recond.</Label>
                <Input
                  id="equipNovoRecond"
                  value={formData.equipNovoRecond}
                  onChange={(e) => setFormData({ ...formData, equipNovoRecond: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marcaTroca">Marca (Troca)</Label>
                <Input
                  id="marcaTroca"
                  value={formData.marcaTroca}
                  onChange={(e) => setFormData({ ...formData, marcaTroca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modeloTroca">Modelo (Troca)</Label>
                <Input
                  id="modeloTroca"
                  value={formData.modeloTroca}
                  onChange={(e) => setFormData({ ...formData, modeloTroca: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mau uso</Label>
              <RadioGroup value={formData.mauUso} onValueChange={(value) => setFormData({ ...formData, mauUso: value })}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="mau-uso-sim" />
                    <Label htmlFor="mau-uso-sim" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="mau-uso-nao" />
                    <Label htmlFor="mau-uso-nao" className="cursor-pointer">Não</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoesPecas">Observações</Label>
              <Textarea
                id="observacoesPecas"
                value={formData.observacoesPecas}
                onChange={(e) => setFormData({ ...formData, observacoesPecas: e.target.value })}
                rows={3}
              />
            </div>
          </section>

          {/* Laudo Técnico */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Considerações Gerais – Laudo Técnico</h2>
            <Separator />

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Problemas Comuns</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_PROBLEMS.map((problem) => {
                    const checkboxId = buildCheckboxId("problema-comum", problem);
                    return (
                      <div key={problem} className="flex items-center space-x-2">
                        <Checkbox
                          id={checkboxId}
                          checked={selectedProblems.includes(problem)}
                          onCheckedChange={(checked) =>
                            handleCommonProblemToggle(problem, checked === true)
                          }
                        />
                        <Label htmlFor={checkboxId} className="text-sm leading-none cursor-pointer">
                          {problem}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defeitoProblema">Defeito/Problema</Label>
                <Textarea
                  id="defeitoProblema"
                  value={formData.defeitoProblema}
                  onChange={(e) => setFormData({ ...formData, defeitoProblema: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosticoTestes">Diagnóstico/Testes realizados</Label>
                <Textarea
                  id="diagnosticoTestes"
                  value={formData.diagnosticoTestes}
                  onChange={(e) => setFormData({ ...formData, diagnosticoTestes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solucao">Solução</Label>
                <Textarea
                  id="solucao"
                  value={formData.solucao}
                  onChange={(e) => setFormData({ ...formData, solucao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Problema resolvido?</Label>
                <RadioGroup
                  value={formData.problemaResolvido}
                  onValueChange={(value) => setFormData({ ...formData, problemaResolvido: value })}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="problema-sim" />
                      <Label htmlFor="problema-sim" className="cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="problema-nao" />
                      <Label htmlFor="problema-nao" className="cursor-pointer">Não</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {formData.problemaResolvido === "nao" && (
                <div className="space-y-2">
                  <Label htmlFor="motivoNaoResolvido">Caso não, descreva o motivo</Label>
                  <Textarea
                    id="motivoNaoResolvido"
                    value={formData.motivoNaoResolvido}
                    onChange={(e) => setFormData({ ...formData, motivoNaoResolvido: e.target.value })}
                    rows={2}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Haverá retorno?</Label>
                <RadioGroup
                  value={formData.haveraRetorno}
                  onValueChange={(value) => setFormData({ ...formData, haveraRetorno: value })}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="retorno-sim" />
                      <Label htmlFor="retorno-sim" className="cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="retorno-nao" />
                      <Label htmlFor="retorno-nao" className="cursor-pointer">Não</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora início</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaTermino">Hora término</Label>
                  <Input
                    id="horaTermino"
                    type="time"
                    value={formData.horaTermino}
                    onChange={(e) => setFormData({ ...formData, horaTermino: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Cliente e Prestador */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Dados do Cliente</h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteNome">Nome Legível</Label>
                <Input
                  id="clienteNome"
                  value={formData.clienteNome}
                  onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clienteRgMatricula">RG ou Matrícula</Label>
                <Input
                  id="clienteRgMatricula"
                  value={formData.clienteRgMatricula}
                  onChange={(e) => setFormData({ ...formData, clienteRgMatricula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clienteTelefone">Telefone</Label>
                <Input
                  id="clienteTelefone"
                  value={formData.clienteTelefone}
                  onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Dados do Prestador</h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prestadorNome">Nome Legível</Label>
                <Input
                  id="prestadorNome"
                  value={formData.prestadorNome}
                  onChange={(e) => setFormData({ ...formData, prestadorNome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prestadorRgMatricula">RG ou Matrícula</Label>
                <Input
                  id="prestadorRgMatricula"
                  value={formData.prestadorRgMatricula}
                  onChange={(e) => setFormData({ ...formData, prestadorRgMatricula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prestadorTelefone">Telefone</Label>
                <Input
                  id="prestadorTelefone"
                  value={formData.prestadorTelefone}
                  onChange={(e) => setFormData({ ...formData, prestadorTelefone: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Botão Gerar PDF */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleGeneratePDF}
              size="lg"
              className="gap-2"
            >
              <Printer className="h-5 w-5" />
              Gerar e Imprimir RAT
            </Button>
          </div>
            </Card>
            <Card className="p-6 space-y-4 h-fit">
              <RatHistoryList
                history={ratHistory}
                onSelect={handleRatHistorySelect}
                onClear={handleRatHistoryClear}
              />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default RatForm;
