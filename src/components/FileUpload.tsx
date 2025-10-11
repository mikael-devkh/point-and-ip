import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

export interface StoreData {
  numeroLoja: string;
  nomeLoja: string;
  ipDesktop: string;
  ipPDV: string;
}

interface FileUploadProps {
  onFileLoaded: (data: StoreData[]) => void;
}

export const FileUpload = ({ onFileLoaded }: FileUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      
      // Skip header if present
      const startIndex = lines[0].toLowerCase().includes("loja") ? 1 : 0;
      
      const data = lines.slice(startIndex).map((line) => {
        const cols = line.split(/[,;]/).map((s) => s.trim());
        
        // Formato esperado: A=Loja, B=Nome, H=IP Desktop (índice 7), P=IP PDV (índice 15)
        return {
          numeroLoja: cols[0] || "",
          nomeLoja: cols[1] || "",
          ipDesktop: cols[7] || "",
          ipPDV: cols[15] || ""
        };
      }).filter((item) => item.numeroLoja && (item.ipDesktop || item.ipPDV));

      if (data.length > 0) {
        onFileLoaded(data);
        toast.success(`${data.length} lojas carregadas!`);
      } else {
        toast.error("Nenhum dado válido encontrado no arquivo");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept=".csv,.txt"
        onChange={handleFileChange}
        id="file-upload"
        className="hidden"
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="outline"
          className="w-full border-border hover:bg-secondary"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Carregar Planilha (CSV)
        </Button>
      </label>
      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary p-2 rounded-md">
          <FileText className="h-4 w-4" />
          <span>{fileName}</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Formato: A=Nº Loja, B=Nome, H=IP Desktop, P=IP PDV
      </p>
    </div>
  );
};
