import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { IPConfig } from "@/utils/ipCalculator";

export interface HistoryItem extends IPConfig {
  tipo: string;
  numeroPDV?: string;
  timestamp: number;
  fsa?: string;
}

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryList = ({ history, onSelect, onClear }: HistoryListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return history;
    }

    return history.filter((item) => {
      if (!item.fsa) {
        return false;
      }
      return item.fsa.toLowerCase().includes(normalizedTerm);
    });
  }, [history, searchTerm]);

  const hasHistory = history.length > 0;
  const hasFilteredResults = filteredHistory.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Consultas Recentes
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={!hasHistory}
        >
          Limpar Histórico
        </Button>
      </div>

      <Input
        placeholder="Pesquisar por FSA"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        disabled={!hasHistory}
      />

      {!hasHistory ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma consulta recente</p>
        </div>
      ) : hasFilteredResults ? (
        filteredHistory.map((item, index) => (
          <Card
            key={`${item.timestamp}-${index}`}
            onClick={() => onSelect(item)}
            className="p-4 bg-secondary border-border cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {item.nomeLoja} - {item.tipo} {item.numeroPDV ? `#${item.numeroPDV}` : ""}
                </p>
                <p className="text-sm text-primary">{item.ip}</p>
                {item.fsa && <p className="text-xs text-muted-foreground">FSA: {item.fsa}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-md">
          Nenhum registro correspondente ao FSA informado.
        </div>
      )}
    </div>
  );
};
