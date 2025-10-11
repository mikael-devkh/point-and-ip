import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SearchFormProps {
  onSearch: (store: string, pdv: string) => void;
}

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [store, setStore] = useState("");
  const [pdv, setPdv] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.trim() && pdv.trim()) {
      onSearch(store.trim(), pdv.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="store" className="text-foreground">
          Loja
        </Label>
        <Input
          id="store"
          type="text"
          placeholder="Ex: Loja Centro"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdv" className="text-foreground">
          Número do PDV
        </Label>
        <Input
          id="pdv"
          type="text"
          placeholder="Ex: 001"
          value={pdv}
          onChange={(e) => setPdv(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all hover:shadow-glow"
      >
        <Search className="mr-2 h-4 w-4" />
        Buscar IP
      </Button>
    </form>
  );
};
