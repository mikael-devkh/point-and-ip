import { useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Layers, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { Procedure } from "@/data/troubleshootingData";
import { EditableText } from "@/components/EditableText";
import { ProcedureEditorDialog } from "@/components/ProcedureEditorDialog";
import {
  loadEditableProcedures,
  resetToDefaults,
  saveProceduresToLocalStorage,
} from "@/utils/data-editor-utils";
import { cn } from "@/lib/utils";
import { RatTemplatesBrowser } from "@/components/RatTemplatesBrowser";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface EditableProcedureCardProps {
  procedure: Procedure;
  onSelect: (procedure: Procedure) => void;
  onUpdate: (procedure: Procedure) => void;
  onDelete: (id: string) => void;
}

const EditableProcedureCard = ({
  procedure,
  onSelect,
  onUpdate,
  onDelete,
}: EditableProcedureCardProps) => {
  const handleTitleSave = (newTitle: string) => {
    onUpdate({ ...procedure, title: newTitle });
  };

  const handleTagsSave = (newTags: string) => {
    const tagsArray = newTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    onUpdate({ ...procedure, tags: tagsArray });
  };

  return (
    <Card className="p-4 bg-background/50 border-border shadow-md transition-colors space-y-2 group">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 space-y-1">
          <EditableText
            initialValue={procedure.title}
            onSave={handleTitleSave}
            className="text-lg font-semibold text-foreground cursor-text"
            placeholder="Título do Procedimento"
          />
          <EditableText
            initialValue={procedure.tags.join(", ")}
            onSave={handleTagsSave}
            className="text-xs text-muted-foreground italic cursor-text"
            placeholder="Tags (separadas por vírgula)"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(procedure.id)}
          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remover Procedimento"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-between items-end pt-2 border-t border-dashed border-border/70">
        <Button variant="link" size="sm" onClick={() => onSelect(procedure)} className="p-0 h-auto">
          Visualizar Detalhes
        </Button>
        <ProcedureEditorDialog procedure={procedure} onSave={onUpdate} />
      </div>
    </Card>
  );
};

const SupportCenter = () => {
  const isMobile = useIsMobile();
  const [kbData, setKbData] = useState<Procedure[]>(() => loadEditableProcedures());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [templatesResetSignal, setTemplatesResetSignal] = useState(0);
  const [activeDesktopTab, setActiveDesktopTab] = useState<"kb" | "templates">("kb");
  const [activeMobileTab, setActiveMobileTab] = useState<"kb" | "templates">("kb");

  const filteredProcedures = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return kbData;
    }

    return kbData.filter(
      (procedure) =>
        procedure.title.toLowerCase().includes(normalizedSearch) ||
        procedure.content.toLowerCase().includes(normalizedSearch) ||
        procedure.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch)),
    );
  }, [kbData, searchTerm]);

  const handleProcedureUpdate = (updated: Procedure) => {
    setKbData((previous) => {
      const index = previous.findIndex((procedure) => procedure.id === updated.id);
      if (index === -1) {
        return previous;
      }
      const next = [...previous];
      next[index] = updated;
      saveProceduresToLocalStorage(next);
      return next;
    });
    if (selectedProcedure?.id === updated.id) {
      setSelectedProcedure(updated);
    }
  };

  const handleProcedureDelete = (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Tem certeza que deseja remover este procedimento da base?")) {
      return;
    }
    setKbData((previous) => {
      const next = previous.filter((procedure) => procedure.id !== id);
      saveProceduresToLocalStorage(next);
      if (selectedProcedure?.id === id) {
        setSelectedProcedure(null);
      }
      toast.success("Procedimento removido.");
      return next;
    });
  };

  const handleAddProcedure = () => {
    const newProcedure: Procedure = {
      id: `kb-${Date.now()}`,
      title: "Novo Procedimento",
      tags: ["novo", "rascunho"],
      content: "## Conteúdo\n\nAtualize as etapas deste procedimento.",
    };
    setKbData((previous) => {
      const next = [newProcedure, ...previous];
      saveProceduresToLocalStorage(next);
      toast.success("Procedimento criado. Atualize o conteúdo pelo editor.");
      return next;
    });
  };

  const handleResetLocalData = () => {
    if (typeof window !== "undefined" && !window.confirm("Deseja remover todos os dados editados e restaurar os padrões?")) {
      return;
    }
    const snapshot = resetToDefaults();
    setKbData(snapshot.procedures);
    setSelectedProcedure(null);
    setTemplatesResetSignal((value) => value + 1);
  };

  const proceduresPanel = (
    <Card className="p-6 space-y-4 shadow-lg">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Base de Conhecimento (Offline)
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddProcedure} variant="secondary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Novo Procedimento
          </Button>
          <Button onClick={handleResetLocalData} variant="destructive" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Resetar Dados Locais
          </Button>
        </div>
      </div>
      <Separator />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar procedimentos por título, conteúdo ou tag"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setSelectedProcedure(null);
          }}
          className="w-full pl-10"
        />
      </div>
      {selectedProcedure ? (
        <ScrollArea className="h-[500px] rounded-md border p-4 bg-background">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <h3 className="text-2xl font-bold text-primary">{selectedProcedure.title}</h3>
              <Button variant="outline" onClick={() => setSelectedProcedure(null)} className="gap-1.5">
                Voltar
              </Button>
            </div>
            <div className="space-y-2 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {selectedProcedure.content}
            </div>
            <div className="flex justify-end pt-4">
              <ProcedureEditorDialog procedure={selectedProcedure} onSave={handleProcedureUpdate} />
            </div>
          </div>
        </ScrollArea>
      ) : (
        <>
          <p className={cn("text-sm text-muted-foreground", !filteredProcedures.length && "text-center")}>
            {filteredProcedures.length
              ? `Encontrados ${filteredProcedures.length} procedimentos. Clique para editar.`
              : "Nenhum procedimento encontrado. Utilize o botão de criar para adicionar um novo."}
          </p>
          <ScrollArea className="h-[500px] rounded-md border p-4 bg-background">
            <div className="space-y-3">
              {filteredProcedures.map((procedure) => (
                <EditableProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                  onSelect={setSelectedProcedure}
                  onUpdate={handleProcedureUpdate}
                  onDelete={handleProcedureDelete}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </Card>
  );

  const templatesPanel = (
    <RatTemplatesBrowser
      resetSignal={templatesResetSignal}
      onRequestGlobalReset={handleResetLocalData}
    />
  );

  const renderTabsContent = () => {
    if (isMobile) {
      return (
        <Tabs
          value={activeMobileTab}
          onValueChange={(value) => setActiveMobileTab(value as "kb" | "templates")}
          className="space-y-4"
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="kb">Base de Conhecimento</TabsTrigger>
            <TabsTrigger value="templates">Templates RAT</TabsTrigger>
          </TabsList>
          <TabsContent value="kb" className="space-y-4">
            {proceduresPanel}
          </TabsContent>
          <TabsContent value="templates" className="space-y-4">
            {templatesPanel}
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <Tabs
        value={activeDesktopTab}
        onValueChange={(value) => setActiveDesktopTab(value as "kb" | "templates")}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kb">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="templates">Templates RAT</TabsTrigger>
        </TabsList>
        <TabsContent value="kb" className="space-y-4">
          {proceduresPanel}
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          {templatesPanel}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-primary px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-secondary rounded-2xl shadow-glow">
                <Layers className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Centro de Suporte e Biblioteca Técnica</h1>
            <p className="text-muted-foreground">
              Pesquise procedimentos, mantenha a base de conhecimento offline atualizada e aplique laudos sugeridos diretamente na RAT.
            </p>
          </header>
          {renderTabsContent()}
        </div>
      </div>
    </>
  );
};

export default SupportCenter;
