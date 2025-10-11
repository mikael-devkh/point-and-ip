import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileLoaded: (data: Array<{ store: string; pdv: string; ip: string }>) => void;
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
      const dataLines = lines[0].toLowerCase().includes("loja") ? lines.slice(1) : lines;
      
      const data = dataLines.map((line) => {
        const [store, pdv, ip] = line.split(/[,;]/).map((s) => s.trim());
        return { store, pdv, ip };
      }).filter((item) => item.store && item.pdv && item.ip);

      if (data.length > 0) {
        onFileLoaded(data);
        toast.success(`${data.length} registros carregados!`);
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
    </div>
  );
};
