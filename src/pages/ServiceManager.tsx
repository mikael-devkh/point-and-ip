import { useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { calculateBilling } from "@/utils/billing-calculator";
import {
  ActiveCall,
  MediaStatus,
  RequiredMediaType,
  useServiceManager,
} from "@/hooks/use-service-manager";
import { cn } from "@/lib/utils";
import {
  Camera,
  CheckCircle,
  ClipboardList,
  DollarSign,
  FileArchive,
  FileDown,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const REQUIRED_MEDIA_LABELS: Record<RequiredMediaType, { label: string; icon: React.ElementType; optional?: boolean }> = {
  serial: { label: "Foto do Serial do Ativo", icon: Camera },
  defect_photo: { label: "Foto do Defeito", icon: Camera },
  solution_video: { label: "Vídeo da Solução/Defeito", icon: Video },
  workbench_photo: { label: "Foto da Bancada/Local", icon: Camera },
  replacement_serial: { label: "Foto do Serial de Troca (Opcional)", icon: Camera, optional: true },
};

const statusLabel: Record<ActiveCall["status"], string> = {
  open: "Em andamento",
  completed: "Pronto para faturamento",
  archived: "Arquivado",
};

const REQUIRED_MEDIA_ORDER: RequiredMediaType[] = [
  "serial",
  "defect_photo",
  "solution_video",
  "workbench_photo",
  "replacement_serial",
];

const ActiveCallCard = ({
  call,
  onToggleMedia,
  onComplete,
  onRemove,
}: {
  call: ActiveCall;
  onToggleMedia: (media: RequiredMediaType) => void;
  onComplete: () => void;
  onRemove: () => void;
}) => {
  const isReadyToComplete = REQUIRED_MEDIA_ORDER.slice(0, 4).every(
    (media) => call.photos[media] === "uploaded"
  );

  return (
    <Card className="border-border bg-background/70 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            FSA #{call.fsa}
          </CardTitle>
          <Badge variant={call.status === "completed" ? "secondary" : "outline"}>
            {statusLabel[call.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Loja {call.codigoLoja}
          {call.pdv ? ` • PDV ${call.pdv}` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {REQUIRED_MEDIA_ORDER.map((media) => {
            const { label, icon: Icon, optional } = REQUIRED_MEDIA_LABELS[media];
            const status = call.photos[media];
            const isUploaded = status === "uploaded";

            return (
              <div
                key={media}
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-2",
                  isUploaded ? "border-green-500/60 bg-green-500/10" : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3 text-sm">
                  <Icon className={cn("h-4 w-4", isUploaded ? "text-green-600" : "text-muted-foreground")} />
                  <span className="font-medium text-foreground">{label}</span>
                  {optional && <span className="text-xs text-muted-foreground">(Opcional)</span>}
                </div>
                <Button
                  size="sm"
                  variant={isUploaded ? "secondary" : "outline"}
                  onClick={() => onToggleMedia(media)}
                  className="gap-2"
                >
                  {isUploaded ? <CheckCircle className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  {isUploaded ? "Marcado" : "Mock Upload"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <Button
            onClick={onComplete}
            disabled={!isReadyToComplete || call.status === "completed"}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" /> Exportar ZIP e Encerrar Chamado
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive gap-2">
            <Trash2 className="h-4 w-4" /> Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ServiceManager = () => {
  const isMobile = useIsMobile();
  const { activeCalls, addCall, removeCall, updatePhotoStatus, completeCall } = useServiceManager();
  const [codigoLoja, setCodigoLoja] = useState("");
  const [fsa, setFsa] = useState("");
  const [pdv, setPdv] = useState("");

  const billing = useMemo(() => calculateBilling(activeCalls.length), [activeCalls.length]);

  const handleAddCall = () => {
    if (!codigoLoja.trim() || !fsa.trim()) {
      toast.error("Informe o código da loja e o FSA.");
      return;
    }

    addCall({ codigoLoja: codigoLoja.trim(), fsa: fsa.trim(), pdv: pdv.trim() || undefined });
    toast.success("Atendimento adicionado à agenda.");
    setCodigoLoja("");
    setFsa("");
    setPdv("");
  };

  const handleToggleMedia = (callId: string, media: RequiredMediaType, currentStatus: MediaStatus) => {
    const nextStatus: MediaStatus = currentStatus === "uploaded" ? "missing" : "uploaded";
    updatePhotoStatus(callId, media, nextStatus);
    toast.info(nextStatus === "uploaded" ? "Mídia marcada como recebida." : "Mídia marcada como pendente.");
  };

  const handleComplete = (callId: string) => {
    completeCall(callId);
    toast.success("Chamado pronto para faturamento! Exportação mock concluída.");
  };

  const billingCard = (
    <Card className="h-full border-primary/50 bg-background/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <DollarSign className="h-5 w-5" />
          Previsão de Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-foreground">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Chamados ativos</p>
          <p className="text-3xl font-bold">{billing.totalActiveCount}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Chamado inicial</span>
            <span className="font-semibold">R$ {billing.baseFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ativos extras</span>
            <span className="font-semibold">R$ {billing.extraActiveFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total estimado</span>
            <span>R$ {billing.totalFee.toFixed(2)}</span>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Valores adicionais por hora excedente (R$ 20,00) são aplicáveis após 120 minutos de atendimento.
          </p>
          <div className="rounded-md border border-border bg-card p-3 text-xs">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ClipboardList className="h-4 w-4 text-primary" /> Checklist de mídia obrigatório
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Serial do ativo</li>
              <li>Foto do defeito</li>
              <li>Vídeo da solução ou defeito</li>
              <li>Foto da bancada/local</li>
              <li>Serial de troca (quando aplicável)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const callsCard = (
    <Card className="lg:col-span-2 border-border bg-background/90">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileArchive className="h-5 w-5 text-primary" /> Gestão de Chamados em Campo
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Adicione FSAs, confira as evidências e finalize o atendimento antes da exportação.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="codigo-loja">Código da Loja</Label>
            <Input
              id="codigo-loja"
              placeholder="Ex: 1250"
              value={codigoLoja}
              onChange={(event) => setCodigoLoja(event.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fsa">FSA</Label>
            <Input
              id="fsa"
              placeholder="Ex: 456789"
              value={fsa}
              onChange={(event) => setFsa(event.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pdv">PDV</Label>
            <Input
              id="pdv"
              placeholder="Opcional"
              value={pdv}
              onChange={(event) => setPdv(event.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddCall} className="w-full gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
            <ClipboardList className="h-10 w-10" />
            <p>Nenhum atendimento ativo. Cadastre um FSA para iniciar um novo chamado.</p>
          </div>
        ) : (
          <ScrollArea className="h-[520px] pr-4">
            <div className="space-y-4">
              {activeCalls.map((call) => (
                <ActiveCallCard
                  key={call.id}
                  call={call}
                  onToggleMedia={(media) => handleToggleMedia(call.id, media, call.photos[media])}
                  onComplete={() => handleComplete(call.id)}
                  onRemove={() => removeCall(call.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-primary px-4 py-8 pt-24">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-2xl bg-secondary p-3 shadow-glow">
                <FileArchive className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Service Manager - Atendimento em Campo</h1>
            <p className="text-muted-foreground">
              Controle atendimentos, checklist de mídia e previsão de faturamento direto do tablet ou smartphone.
            </p>
          </header>

          {isMobile ? (
            <div className="space-y-6">
              {billingCard}
              {callsCard}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">{billingCard}</div>
              {callsCard}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ServiceManager;
