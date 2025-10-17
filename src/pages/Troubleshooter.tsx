import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, HelpCircle, Search, Zap, ChevronLeft } from "lucide-react";
import { mockProcedures, mockTroubleshootingFlow, Procedure } from "@/data/troubleshootingData";
import { GuidedChecklist } from "@/components/GuidedChecklist";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ProcedureCard = ({ procedure, onSelect }: { procedure: Procedure; onSelect: (p: Procedure) => void }) => (
  <Card
    className="p-4 bg-background/50 border-border cursor-pointer hover:bg-secondary transition-colors shadow-sm"
    onClick={() => onSelect(procedure)}
  >
    <div className="space-y-1">
      <p className="font-medium text-foreground">{procedure.title}</p>
      <div className="flex gap-2 flex-wrap pt-1">
        {procedure.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground bg-accent/20 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </Card>
);

const Troubleshooter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);

  const filteredProcedures = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return mockProcedures;
    }

    return mockProcedures.filter(
      (p) =>
        p.title.toLowerCase().includes(normalizedSearch) ||
        p.content.toLowerCase().includes(normalizedSearch) ||
        p.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
    );
  }, [searchTerm]);

  const renderContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      const key = `${selectedProcedure?.id}-${index}`;
      if (line.startsWith("## "))
        return (
          <h2 key={key} className="text-xl font-bold mt-4 mb-2 text-primary">
            {line.replace("## ", "")}
          </h2>
        );
      if (line.startsWith("* "))
        return (
          <p key={key} className="text-sm text-foreground/90 pl-6 relative">
            <span className="absolute left-0">•</span>
            {line.replace("* ", "").trim()}
          </p>
        );
      if (/^\d+\./.test(line))
        return (
          <p key={key} className="pl-4 font-semibold text-foreground/90">
            {line}
          </p>
        );
      if (line.startsWith("**IMPORTANTE**:"))
        return (
          <p
            key={key}
            className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-md border border-yellow-300 dark:border-yellow-700 text-sm font-medium text-yellow-800 dark:text-yellow-200 mt-2"
          >
            {line.replace("**IMPORTANTE**:", "").trim()}
          </p>
        );
      if (!line.trim()) return <br key={key} />;
      return (
        <p key={key} className="text-sm text-foreground/90">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-primary px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-secondary rounded-2xl shadow-glow">
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Diagnóstico Rápido e Procedimentos</h1>
            <p className="text-muted-foreground">
              Utilize o checklist guiado ou pesquise procedimentos técnicos offline.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Checklist de Troubleshooting
              </h2>
              <GuidedChecklist flowData={mockTroubleshootingFlow} />
            </div>

            <Card className="lg:col-span-2 p-6 space-y-4 shadow-lg">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Base de Conhecimento (Offline)
              </h2>
              <Separator />

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por PDV, Zebra, INIT, formatação, etc."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedProcedure(null);
                  }}
                  className="w-full pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {selectedProcedure ? (
                <ScrollArea className="h-[500px] rounded-md border p-4 bg-background">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary">{selectedProcedure.title}</h3>
                    <div className="prose dark:prose-invert max-w-none space-y-2">
                      {renderContent(selectedProcedure.content)}
                    </div>
                    <Button variant="outline" onClick={() => setSelectedProcedure(null)}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Voltar à lista
                    </Button>
                  </div>
                </ScrollArea>
              ) : (
                <>
                  <p className={cn("text-sm text-muted-foreground", !filteredProcedures.length && "text-center")}>
                    {filteredProcedures.length > 0
                      ? `Encontrados ${filteredProcedures.length} procedimentos:`
                      : "Nenhum procedimento encontrado. Tente termos de busca diferentes."}
                  </p>
                  <ScrollArea className="h-[500px] rounded-md border p-4 bg-background">
                    <div className="space-y-3">
                      {filteredProcedures.map((procedure) => (
                        <ProcedureCard key={procedure.id} procedure={procedure} onSelect={setSelectedProcedure} />
                      ))}
                      {!filteredProcedures.length && (
                        <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-md">
                          Nenhum resultado encontrado.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Troubleshooter;
