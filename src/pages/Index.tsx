import { useState, useEffect } from "react";
import { SearchForm } from "@/components/SearchForm";
import { ResultCard } from "@/components/ResultCard";
import { HistoryList } from "@/components/HistoryList";
import { FileUpload } from "@/components/FileUpload";
import { Network } from "lucide-react";
import { toast } from "sonner";

interface StoreData {
  store: string;
  pdv: string;
  ip: string;
}

interface HistoryItem extends StoreData {
  timestamp: number;
}

const Index = () => {
  const [storeData, setStoreData] = useState<StoreData[]>([]);
  const [result, setResult] = useState<StoreData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSearch = (store: string, pdv: string) => {
    const found = storeData.find(
      (item) =>
        item.store.toLowerCase().includes(store.toLowerCase()) &&
        item.pdv === pdv
    );

    if (found) {
      setResult(found);
      const newHistoryItem = { ...found, timestamp: Date.now() };
      const newHistory = [newHistoryItem, ...history.slice(0, 9)];
      setHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      toast.success("IP encontrado!");
    } else {
      toast.error("Loja ou PDV não encontrados");
      setResult(null);
    }
  };

  const handleFileLoaded = (data: StoreData[]) => {
    setStoreData(data);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item);
  };

  return (
    <div className="min-h-screen bg-gradient-primary px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-secondary rounded-2xl shadow-glow">
              <Network className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Consulta de IPs
          </h1>
          <p className="text-muted-foreground">
            Busque o endereço IP de qualquer PDV
          </p>
        </header>

        <div className="space-y-6">
          <FileUpload onFileLoaded={handleFileLoaded} />
          
          {storeData.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <SearchForm onSearch={handleSearch} />
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ResultCard
                store={result.store}
                pdv={result.pdv}
                ip={result.ip}
              />
            </div>
          )}

          {history.length > 0 && (
            <HistoryList history={history} onSelect={handleHistorySelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
