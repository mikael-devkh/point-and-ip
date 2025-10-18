import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetType, RatTemplate, TemplateStatus } from "@/data/ratTemplatesData";
import { EditableText } from "@/components/EditableText";
import { cn } from "@/lib/utils";
import { loadEditableTemplates, saveTemplatesToLocalStorage } from "@/utils/data-editor-utils";
import { toast } from "sonner";
import { useRatAutofill } from "@/context/RatAutofillContext";
import { Layers, Plus, RotateCcw, Trash2, Wand2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const assetLabels: Record<AssetType, string> = {
  CPU: "CPU",
  MONITOR: "Monitor",
  IMPRESSORA_PDV: "Impressora PDV",
  IMPRESSORA_ETIQUETA: "Impressora Etiqueta",
  TECLADO: "Teclado",
  GAVETA: "Gaveta",
  THIN_CLIENT: "Thin Client",
  SISTEMA: "Sistema",
};

const statusLabels: Record<TemplateStatus, string> = {
  OPERACIONAL: "Operacional",
  TROCA_PECA: "Necessário trocar peça",
  TROCA_COMPLETA: "Necessário trocar ativo completo",
  REPARO_LIMPEZA: "Reparo/Limpeza",
  CONFIG_REDE: "Configuração de Rede",
  REPARO_SOFTWARE: "Reparo de Software",
  FALHA_PERSISTENTE: "Falha persistente / Escalar",
};

interface RatTemplatesBrowserProps {
  resetSignal?: number;
  onRequestGlobalReset?: () => void;
}

interface TemplateEditorCardProps {
  template: RatTemplate;
  isActive: boolean;
  onSelect: (id: string) => void;
  onUpdate: (template: RatTemplate) => void;
  onDelete: (id: string) => void;
}

const TemplateEditorCard = ({
  template,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
}: TemplateEditorCardProps) => {
  const handleTitleSave = useCallback(
    (newTitle: string) => {
      onUpdate({ ...template, title: newTitle });
    },
    [template, onUpdate],
  );

  const handleAssetChange = (value: AssetType) => {
    onUpdate({ ...template, asset: value });
  };

  const handleStatusChange = (value: TemplateStatus) => {
    onUpdate({ ...template, status: value });
  };

  return (
    <Card
      className={cn(
        "group p-4 bg-background/50 border-border shadow-sm transition-colors space-y-3",
        isActive && "border-primary shadow-lg",
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <EditableText
          initialValue={template.title}
          onSave={handleTitleSave}
          className="text-base font-semibold text-foreground cursor-text"
          placeholder="Título do Laudo"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(template.id)}
          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remover Template"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Ativo</Label>
          <Select value={template.asset} onValueChange={(value) => handleAssetChange(value as AssetType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Ativo" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(assetLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={template.status} onValueChange={(value) => handleStatusChange(value as TemplateStatus)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/70">
        <span className="text-xs text-muted-foreground">ID: {template.id}</span>
        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => onSelect(template.id)}>
          Editar Conteúdo
        </Button>
      </div>
    </Card>
  );
};

export const RatTemplatesBrowser = ({
  resetSignal = 0,
  onRequestGlobalReset,
}: RatTemplatesBrowserProps) => {
  const { setAutofillData } = useRatAutofill();
  const [templates, setTemplates] = useState<RatTemplate[]>(() => loadEditableTemplates());
  const [templateFilter, setTemplateFilter] = useState<AssetType | "all">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateDraft, setTemplateDraft] = useState({
    defeito: "",
    diagnostico: "",
    solucao: "",
  });
  const isMobile = useIsMobile();
  const [activeMobileTab, setActiveMobileTab] = useState<"list" | "detail">("list");

  useEffect(() => {
    setTemplates(loadEditableTemplates());
    setSelectedTemplateId(null);
    setTemplateDraft({ defeito: "", diagnostico: "", solucao: "" });
    setActiveMobileTab("list");
  }, [resetSignal]);

  const filteredTemplates = useMemo(() => {
    if (templateFilter === "all") {
      return templates;
    }
    return templates.filter((template) => template.asset === templateFilter);
  }, [templateFilter, templates]);

  useEffect(() => {
    if (!selectedTemplateId) {
      return;
    }
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) {
      setSelectedTemplateId(null);
      setTemplateDraft({ defeito: "", diagnostico: "", solucao: "" });
      return;
    }
    setTemplateDraft({
      defeito: template.defeito,
      diagnostico: template.diagnostico,
      solucao: template.solucao,
    });
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }
    setActiveMobileTab(selectedTemplateId ? "detail" : "list");
  }, [isMobile, selectedTemplateId]);

  const updateTemplateList = (updater: (templates: RatTemplate[]) => RatTemplate[]) => {
    setTemplates((previous) => {
      const next = updater(previous);
      saveTemplatesToLocalStorage(next);
      return next;
    });
  };

  const handleTemplateUpdate = useCallback(
    (updated: RatTemplate) => {
      updateTemplateList((previous) => {
        const index = previous.findIndex((template) => template.id === updated.id);
        if (index === -1) {
          return previous;
        }
        const next = [...previous];
        next[index] = updated;
        return next;
      });
    },
    [],
  );

  const handleAddTemplate = () => {
    const newTemplate: RatTemplate = {
      id: `template-${Date.now()}`,
      title: "Novo Laudo Técnico",
      asset: "CPU",
      status: "OPERACIONAL",
      defeito: "Descreva o defeito identificado.",
      diagnostico: "Descreva os testes realizados.",
      solucao: "Descreva a solução aplicada ou recomendada.",
    };
    updateTemplateList((previous) => [newTemplate, ...previous]);
    setSelectedTemplateId(newTemplate.id);
    if (isMobile) {
      setActiveMobileTab("detail");
    }
    toast.success("Novo laudo adicionado à biblioteca.");
  };

  const handleTemplateDelete = (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Remover este template permanentemente?")) {
      return;
    }
    updateTemplateList((previous) => previous.filter((template) => template.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
      setTemplateDraft({ defeito: "", diagnostico: "", solucao: "" });
    }
    toast.success("Template removido.");
  };

  const handleTemplateDraftSave = () => {
    if (!selectedTemplateId) {
      toast.error("Selecione um template para salvar as alterações.");
      return;
    }
    updateTemplateList((previous) => {
      const index = previous.findIndex((template) => template.id === selectedTemplateId);
      if (index === -1) {
        return previous;
      }
      const next = [...previous];
      next[index] = {
        ...previous[index],
        defeito: templateDraft.defeito,
        diagnostico: templateDraft.diagnostico,
        solucao: templateDraft.solucao,
      };
      return next;
    });
    toast.success("Laudo atualizado com sucesso.");
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) {
      toast.error("Selecione um template para aplicar na RAT.");
      return;
    }
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) {
      toast.error("Template não encontrado.");
      return;
    }
    setAutofillData({
      title: template.title,
      defeito: templateDraft.defeito,
      diagnostico: templateDraft.diagnostico,
      solucao: templateDraft.solucao,
    });
    toast.success("Laudo pronto para aplicar no formulário de RAT.");
  };

  const handleResetTemplates = () => {
    if (onRequestGlobalReset) {
      onRequestGlobalReset();
      return;
    }
    setTemplates(loadEditableTemplates());
    setSelectedTemplateId(null);
    setTemplateDraft({ defeito: "", diagnostico: "", solucao: "" });
    setActiveMobileTab("list");
    toast.info("Templates recarregados do padrão.");
  };

  const selectedTemplate = selectedTemplateId
    ? templates.find((template) => template.id === selectedTemplateId)
    : null;
  const listPanel = (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Filtrar por ativo</Label>
      <Select value={templateFilter} onValueChange={(value) => setTemplateFilter(value as AssetType | "all")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filtrar por ativo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os ativos</SelectItem>
          {Object.entries(assetLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ScrollArea className="h-[500px] rounded-md border p-4 bg-background">
        <div className="space-y-3">
          {filteredTemplates.length ? (
            filteredTemplates.map((template) => (
              <TemplateEditorCard
                key={template.id}
                template={template}
                isActive={template.id === selectedTemplateId}
                onSelect={setSelectedTemplateId}
                onUpdate={handleTemplateUpdate}
                onDelete={handleTemplateDelete}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum template com o filtro selecionado.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const detailPanel = selectedTemplate ? (
    <Card className="p-4 bg-background border-border space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-primary">{selectedTemplate.title}</h3>
        <p className="text-xs text-muted-foreground">
          {assetLabels[selectedTemplate.asset]} • {statusLabels[selectedTemplate.status]}
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Defeito/Problema</Label>
          <Textarea
            value={templateDraft.defeito}
            onChange={(event) =>
              setTemplateDraft((draft) => ({ ...draft, defeito: event.target.value }))
            }
            rows={5}
          />
        </div>
        <div className="space-y-2">
          <Label>Diagnóstico/Testes</Label>
          <Textarea
            value={templateDraft.diagnostico}
            onChange={(event) =>
              setTemplateDraft((draft) => ({ ...draft, diagnostico: event.target.value }))
            }
            rows={5}
          />
        </div>
        <div className="space-y-2">
          <Label>Solução/Recomendação</Label>
          <Textarea
            value={templateDraft.solucao}
            onChange={(event) =>
              setTemplateDraft((draft) => ({ ...draft, solucao: event.target.value }))
            }
            rows={5}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setActiveMobileTab("list")}
          >
            Voltar
          </Button>
        )}
        <Button variant="outline" className="gap-2" onClick={handleTemplateDraftSave}>
          Salvar Laudo
        </Button>
        <Button className="gap-2" onClick={handleApplyTemplate}>
          <Wand2 className="h-4 w-4" /> Aplicar na RAT
        </Button>
      </div>
    </Card>
  ) : (
    <div className="h-full rounded-md border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
      Selecione um template na lista {isMobile ? "para começar a editar." : "ao lado para editar o conteúdo e aplicar na RAT."}
    </div>
  );

  if (isMobile) {
    return (
      <Card className="p-5 space-y-4 shadow-lg">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Templates RAT
          </h2>
          <p className="text-sm text-muted-foreground">
            Ajuste os textos padrões da RAT e envie o laudo diretamente para o formulário.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={handleAddTemplate} variant="secondary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Novo Laudo
          </Button>
          <Button onClick={handleResetTemplates} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Restaurar Padrões
          </Button>
        </div>
        <Tabs value={activeMobileTab} onValueChange={(value) => setActiveMobileTab(value as "list" | "detail")}> 
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="list">Biblioteca</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedTemplate}>
              {selectedTemplate ? "Laudo Selecionado" : "Selecione um Laudo"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="space-y-3 pt-4">
            {listPanel}
          </TabsContent>
          <TabsContent value="detail" className="space-y-3 pt-4">
            {detailPanel}
          </TabsContent>
        </Tabs>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 shadow-lg">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" /> Templates RAT
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddTemplate} variant="secondary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Novo Laudo
          </Button>
          <Button onClick={handleResetTemplates} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Restaurar Padrões
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr,1.5fr]">
        {listPanel}
        <div className="space-y-3">{detailPanel}</div>
      </div>
    </Card>
  );
};
