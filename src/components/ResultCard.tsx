import { Card } from "@/components/ui/card";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ResultCardProps {
  store: string;
  pdv: string;
  ip: string;
}

export const ResultCard = ({ store, pdv, ip }: ResultCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ip);
    setCopied(true);
    toast.success("IP copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Loja</p>
            <p className="text-lg font-semibold text-foreground">{store}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">PDV</p>
            <p className="text-lg font-semibold text-foreground">{pdv}</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm text-muted-foreground">Endereço IP</p>
            <p className="text-2xl font-bold text-primary">{ip}</p>
          </div>
          <Button
            onClick={handleCopy}
            size="icon"
            variant="ghost"
            className="hover:bg-secondary"
          >
            {copied ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Copy className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
