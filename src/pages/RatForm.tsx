import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/Navigation";
import { FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { generateRatPDF } from "@/utils/ratPdfGenerator";

interface RatFormData {
  // Identificação
  codigoLoja: string;
  pdv: string;
  fsa: string;
  endereco: string;
  cidade: string;
  uf: string;
  nomeSolicitante: string;

  // Equipamentos
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

  // Peças/Cabos
  pecasCabos: string[];
  
  // Peças Impressora
  pecasImpressora: string[];
  mauUso: string;
  observacoesPecas: string;

  // Laudo Técnico
  defeitoProblema: string;
  diagnosticoTestes: string;
  solucao: string;
  problemaResolvido: string;
  motivoNaoResolvido: string;
  haveraRetorno: string;
  horaInicio: string;
  horaTermino: string;
  data: string;

  // Cliente
  clienteNome: string;
  clienteRgMatricula: string;
  clienteTelefone: string;

  // Prestador
  prestadorNome: string;
  prestadorRgMatricula: string;
  prestadorTelefone: string;
}

const RatForm = () => {
  const [formData, setFormData] = useState<RatFormData>({
    codigoLoja: "",
    pdv: "",
    fsa: "",
    endereco: "",
    cidade: "",
    uf: "",
    nomeSolicitante: "",
    equipamentos: [],
    patrimonioNumeroSerie: "",
    equipComDefeito: "",
    marca: "",
    modelo: "",
    origemEquipamento: "",
    numeroSerieTroca: "",
    equipNovoRecond: "",
    marcaTroca: "",
    modeloTroca: "",
    pecasCabos: [],
    pecasImpressora: [],
    mauUso: "",
    observacoesPecas: "",
    defeitoProblema: "",
    diagnosticoTestes: "",
    solucao: "",
    problemaResolvido: "",
    motivoNaoResolvido: "",
    haveraRetorno: "",
    horaInicio: "",
    horaTermino: "",
    data: "",
    clienteNome: "",
    clienteRgMatricula: "",
    clienteTelefone: "",
    prestadorNome: "",
    prestadorRgMatricula: "",
    prestadorTelefone: "",
  });

  const equipamentosList = [
    "01-PDV-Teclado", "02-PDV-Scanner", "03-PDV-Impressora", "04-PDV-Monitor",
    "05-PDV-Gaveta", "06-PDV-CPU", "07-Desktop-Gerente", "08-Desktop +Aqui",
    "09-Desktop-Almox.", "10-Desktop-Tesouraria", "11-Impressora-Zebra/Printronix", "12-Outros..."
  ];

  const origemEquipamentos = [
    "E1-Novo Delfia", "E2-Novo Parceiro", "E3-Recond. Delfia", "E4-Equip.Americanas",
    "E5-Peça-Delfia", "E6-Peça-Parceiro", "E7-Peça-Americanas", "E8-Garantia Schalter",
    "E9-Garantia Delfia", "E10-Garantia Parceiro"
  ];

  const pecasCabosList = [
    "13-CPU/Desktop - HD/SSD", "14-CPU/Desktop - Memória", "15-CPU/Desktop - Fonte Interna",
    "16-CPU/Desktop - Fonte Externa", "17-CPU/Desktop - Mother Board", "18-CPU/Desktop - Botão Power",
    "19-CPU/Desktop – Gabinete", "20-CPU/Desktop – Teclado ABNT", "21-CPU/Desktop - Bateria CMOS",
    "22-Imp-PDV-Fonte", "23-Imp-PDV-Placa Lógica", "24-Imp-PDV-Tampa",
    "25-Gaveta-Miolo", "26-Gaveta-Solenoide", "27-Gaveta-Miolo",
    "28-Gaveta-Chave", "29-Gaveta-Cabo RJ", "30-Monitor-Base",
    "31-Monitor-Fonte", "32-Cabo-Scanner", "33-Cabo-Teclado",
    "34-Cabo-Força", "35-Cabo-VGA/HDI", "36-Cabo-USB",
    "37-Cabo-Sata", "38-Outros"
  ];

  const pecasImpressoraList = [
    "39-Cabeça Imp.", "40-Sup. Cabeça", "41-Platen",
    "42-Sensor Cabeça", "43-Sensor Etiqueta", "44-Placa Lógica",
    "45-Placa Fonte", "46-Fonte Externa", "47-Trava Cabeça",
    "48-Kit Engrenagens", "49-Correia", "50-Painel",
    "51-Print Server", "52-Outros"
  ];

  const handleCheckboxChange = (list: string[], item: string, checked: boolean) => {
    if (checked) {
      return [...list, item];
    } else {
      return list.filter((i) => i !== item);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generateRatPDF(formData);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-primary px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
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

        <Card className="p-6 space-y-8">
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

          {/* Equipamentos Envolvidos */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Equipamentos Envolvidos</h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {equipamentosList.map((equip) => (
                <div key={equip} className="flex items-center space-x-2">
                  <Checkbox
                    id={equip}
                    checked={formData.equipamentos.includes(equip)}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        equipamentos: handleCheckboxChange(formData.equipamentos, equip, checked as boolean),
                      })
                    }
                  />
                  <label htmlFor={equip} className="text-sm cursor-pointer">
                    {equip}
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="patrimonioNumeroSerie">Patrimônio/Número Série ATIVO</Label>
                <Input
                  id="patrimonioNumeroSerie"
                  value={formData.patrimonioNumeroSerie}
                  onChange={(e) => setFormData({ ...formData, patrimonioNumeroSerie: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipComDefeito">Equip. com defeito</Label>
                <Input
                  id="equipComDefeito"
                  value={formData.equipComDefeito}
                  onChange={(e) => setFormData({ ...formData, equipComDefeito: e.target.value })}
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
                {origemEquipamentos.map((origem) => (
                  <div key={origem} className="flex items-center space-x-2">
                    <Checkbox
                      id={origem}
                      checked={formData.origemEquipamento === origem}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          origemEquipamento: checked ? origem : "",
                        })
                      }
                    />
                    <label htmlFor={origem} className="text-sm cursor-pointer">
                      {origem}
                    </label>
                  </div>
                ))}
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
          </section>

          {/* Peças/Cabos */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Peças/Cabos</h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pecasCabosList.map((peca) => (
                <div key={peca} className="flex items-center space-x-2">
                  <Checkbox
                    id={peca}
                    checked={formData.pecasCabos.includes(peca)}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        pecasCabos: handleCheckboxChange(formData.pecasCabos, peca, checked as boolean),
                      })
                    }
                  />
                  <label htmlFor={peca} className="text-sm cursor-pointer">
                    {peca}
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Peças Impressora Térmica */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Peças Imp. Térmica – Zebra/Printronix/Outras</h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pecasImpressoraList.map((peca) => (
                <div key={peca} className="flex items-center space-x-2">
                  <Checkbox
                    id={peca}
                    checked={formData.pecasImpressora.includes(peca)}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        pecasImpressora: handleCheckboxChange(formData.pecasImpressora, peca, checked as boolean),
                      })
                    }
                  />
                  <label htmlFor={peca} className="text-sm cursor-pointer">
                    {peca}
                  </label>
                </div>
              ))}
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
        </div>
      </div>
    </>
  );
};

export default RatForm;
