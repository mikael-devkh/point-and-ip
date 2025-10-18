import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { calculateBilling } from "@/utils/billing-calculator";
import {
  ActiveCall,
  RequiredMediaType,
  StoreTimerRecord,
  getGroupedCalls,
  useServiceManager,
} from "@/hooks/use-service-manager";
import { useServiceTimer } from "@/hooks/use-service-timer";
import { generateZipMock } from "@/utils/zip-generator-mock";
import { fileToBase64 } from "@/utils/file-conversion";
import { cn } from "@/lib/utils";
import {
  Archive,
  Camera,
  ClipboardList,
  Clock,
  DollarSign,
  Eye,
  FileDown,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { toast } from "sonner";

const REQUIRED_MEDIA_LABELS: Record<
  RequiredMediaType,
  { label: string; icon: React.ElementType; optional?: boolean }
> = {
  serial: { label: "Foto do Serial do Ativo", icon: Camera },
  defect_photo: { label: "Foto do Defeito", icon: Camera },
  solution_video: { label: "Vídeo da Solução/Defeito", icon: Video },
  workbench_photo: { label: "Foto da Bancada/Local", icon: Camera },
  replacement_serial: {
    label: "Foto do Serial de Troca (Opcional)",
    icon: Camera,
    optional: true,
  },
};

const REQUIRED_MEDIA_ORDER: RequiredMediaType[] = [
  "serial",
  "defect_photo",
  "solution_video",
  "workbench_photo",
  "replacement_serial",
];

const MANDATORY_MEDIA: RequiredMediaType[] = REQUIRED_MEDIA_ORDER.slice(0, 4);

const MEDIA_INPUT_CONFIG: Record<
  RequiredMediaType,
  { accept: string; capture?: string }
> = {
  serial: { accept: "image/*", capture: "environment" },
  defect_photo: { accept: "image/*", capture: "environment" },
  solution_video: { accept: "video/*", capture: "environment" },
  workbench_photo: { accept: "image/*", capture: "environment" },
  replacement_serial: { accept: "image/*", capture: "environment" },
};

const statusLabel: Record<ActiveCall["status"], string> = {
  open: "Em andamento",
  completed: "Pronto para faturar",
  archived: "Arquivado",
};

const formatMinutes = (minutes: number) => {
  if (!minutes) return "0 min";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (rest) parts.push(`${rest}min`);
  return parts.join(" ") || "0 min";
};

const formatDateLabel = (dateIso: string) => {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const ActiveCallCard = ({
  call,
  storeRecord,
  storeMinutes,
  onUploadMedia,
  onRemoveMedia,
  onComplete,
  onRemove,
}: {
  call: ActiveCall;
  storeRecord?: StoreTimerRecord;
  storeMinutes: number;
  onUploadMedia: (media: RequiredMediaType, file: File) => Promise<void>;
  onRemoveMedia: (media: RequiredMediaType) => void;
  onComplete: () => void;
  onRemove: () => void;
}) => {
  const isReadyToComplete = MANDATORY_MEDIA.every(
    (media) => call.photos[media]?.status === "uploaded"
  );
  const [uploadingMedia, setUploadingMedia] = useState<
    RequiredMediaType | null
  >(null);

  const handleFileChange = async (
    media: RequiredMediaType,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = "";
      return;
    }

    setUploadingMedia(media);
    try {
      await onUploadMedia(media, file);
    } catch (error) {
      console.error("Falha ao anexar mídia", error);
    } finally {
      setUploadingMedia((current) => (current === media ? null : current));
      event.target.value = "";
    }
  };

  return (
    <Card className="border-border bg-background/70 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            FSA #{call.fsa}
          </CardTitle>
          <Badge
            variant={call.status === "completed" ? "secondary" : "outline"}
            className="capitalize"
          >
            {statusLabel[call.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Loja {call.codigoLoja}
          {call.pdv ? ` • PDV ${call.pdv}` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">
              Tempo registrado: {formatMinutes(storeMinutes)}
            </span>
          </div>
          {storeRecord?.timeStarted && (
            <p className="mt-1 text-xs text-muted-foreground">
              Check-in em andamento desde {new Date(storeRecord.timeStarted).toLocaleTimeString("pt-BR")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {REQUIRED_MEDIA_ORDER.map((media) => {
            const { label, icon: Icon, optional } = REQUIRED_MEDIA_LABELS[media];
            const evidence = call.photos[media];
            const status = evidence?.status ?? "missing";
            const isUploaded = status === "uploaded";
            const inputId = `${call.id}-${media}`;
            const config = MEDIA_INPUT_CONFIG[media];
            const isProcessing = uploadingMedia === media;

            return (
              <div
                key={media}
                className={cn(
                  "flex flex-col gap-2 rounded-md border px-3 py-2 lg:flex-row lg:items-center lg:justify-between",
                  isUploaded
                    ? "border-green-500/60 bg-green-500/10"
                    : "border-border bg-card",
                )}
              >
                <div className="flex items-center gap-3 text-sm">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isUploaded ? "text-green-600" : "text-muted-foreground",
                    )}
                  />
                  <span className="font-medium text-foreground">{label}</span>
                  {optional && (
                    <span className="text-xs text-muted-foreground">(Opcional)</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="text-xs text-muted-foreground">
                    {isUploaded && evidence?.fileName
                      ? `Arquivo: ${evidence.fileName}`
                      : isUploaded
                        ? "Arquivo enviado"
                        : "Pendente"}
                  </div>
                  <input
                    id={inputId}
                    type="file"
                    accept={config.accept}
                    {...(config.capture
                      ? { capture: config.capture as "user" | "environment" }
                      : {})}
                    className="hidden"
                    onChange={(event) => handleFileChange(media, event)}
                  />
                  <Button
                    asChild
                    size="sm"
                    variant={isUploaded ? "secondary" : "outline"}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2">
                      <UploadCloud className="h-4 w-4" />
                      {isUploaded ? "Reenviar" : "Capturar/Enviar"}
                    </label>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => evidence?.dataUrl && window.open(evidence.dataUrl, "_blank")}
                    disabled={!evidence?.dataUrl}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" /> Visualizar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveMedia(media)}
                    disabled={!isUploaded}
                    className="gap-1 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <Button
            onClick={onComplete}
            disabled={!isReadyToComplete || call.status !== "open"}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" /> Exportar ZIP e Encerrar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive gap-2"
          >
            <Trash2 className="h-4 w-4" /> Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ServiceManager = () => {
  const {
    calls,
    activeCalls,
    storeTimers,
    addCall,
    removeCall,
    updatePhotoStatus,
    completeCall,
    archiveAllCompleted,
    startStoreTimer,
    stopStoreTimer,
    resetStoreTimer,
    getStoreTotalMinutes,
  } = useServiceManager();

  const {
    isRunning,
    elapsedTimeMinutes,
    timeDisplay,
    startTimer,
    stopTimer,
    resetTimer,
  } = useServiceTimer();

  const [codigoLoja, setCodigoLoja] = useState("");
  const [fsa, setFsa] = useState("");
  const [pdv, setPdv] = useState("");
  const [timerStoreId, setTimerStoreId] = useState<string>("");

  const billing = useMemo(
    () => calculateBilling(activeCalls.length),
    [activeCalls.length]
  );

  const openCalls = useMemo(
    () => activeCalls.filter((call) => call.status === "open"),
    [activeCalls]
  );

  const openStoreCodes = useMemo(() => {
    return Array.from(new Set(openCalls.map((call) => call.codigoLoja)));
  }, [openCalls]);

  const completedPending = useMemo(
    () => activeCalls.filter((call) => call.status === "completed"),
    [activeCalls]
  );

  const groupedHistory = useMemo(() => getGroupedCalls(calls), [calls]);

  const runningStore = useMemo(() => {
    const activeRecord = Object.values(storeTimers).find(
      (record) => record.timeStarted !== null
    );
    return activeRecord?.codigoLoja ?? "";
  }, [storeTimers]);

  const availableStoreOptions = useMemo(() => {
    const codes = new Set(openStoreCodes);
    if (runningStore) {
      codes.add(runningStore);
    }
    return Array.from(codes);
  }, [openStoreCodes, runningStore]);

  useEffect(() => {
    if (runningStore) {
      setTimerStoreId(runningStore);
      return;
    }
    if (availableStoreOptions.length === 0) {
      setTimerStoreId("");
      return;
    }
    if (!timerStoreId || !availableStoreOptions.includes(timerStoreId)) {
      setTimerStoreId(availableStoreOptions[0]);
    }
  }, [runningStore, availableStoreOptions, timerStoreId]);

  useEffect(() => {
    if (!runningStore && isRunning) {
      resetTimer();
    }
  }, [runningStore, isRunning, resetTimer]);

  const selectedStoreMinutes = useMemo(() => {
    if (!timerStoreId) return 0;
    return getStoreTotalMinutes(timerStoreId);
  }, [
    timerStoreId,
    getStoreTotalMinutes,
    elapsedTimeMinutes,
    storeTimers,
  ]);

  const handleAddCall = () => {
    if (!codigoLoja.trim() || !fsa.trim()) {
      toast.error("Informe o código da loja e o FSA.");
      return;
    }

    addCall({
      codigoLoja: codigoLoja.trim(),
      fsa: fsa.trim(),
      pdv: pdv.trim() || undefined,
    });
    toast.success("Atendimento adicionado à agenda.");
    setCodigoLoja("");
    setFsa("");
    setPdv("");
  };

  const handleMediaUpload = async (
    callId: string,
    media: RequiredMediaType,
    file: File,
  ) => {
    try {
      const dataUrl = await fileToBase64(file);
      updatePhotoStatus(callId, media, "uploaded", {
        dataUrl,
        fileName: file.name || `${media}.${file.type.split("/")[1] ?? "bin"}`,
        mimeType: file.type || "application/octet-stream",
      });
      toast.success(`${REQUIRED_MEDIA_LABELS[media].label} anexada com sucesso.`);
    } catch (error) {
      console.error("Erro ao processar arquivo de mídia", error);
      toast.error("Não foi possível processar o arquivo selecionado.");
      throw error;
    }
  };

  const handleMediaRemove = (callId: string, media: RequiredMediaType) => {
    updatePhotoStatus(callId, media, "missing");
    toast.info("Evidência removida.");
  };

  const handleRemove = (callId: string) => {
    removeCall(callId);
    toast.success("Chamado removido.");
  };

  const handleComplete = async (call: ActiveCall) => {
    const isReady = MANDATORY_MEDIA.every(
      (media) => call.photos[media]?.status === "uploaded"
    );
    if (!isReady) {
      toast.error("Finalize todas as evidências obrigatórias antes de encerrar.");
      return;
    }

    const finalCall: ActiveCall = {
      ...call,
      status: "completed",
      timeStarted: null,
      timeTotalServiceMinutes: getStoreTotalMinutes(call.codigoLoja),
    };

    await generateZipMock(finalCall);
    completeCall(call.id, finalCall.timeTotalServiceMinutes);
    toast.success("Chamado pronto para faturamento! Evidências exportadas.");
  };

  const handleArchiveCompleted = () => {
    archiveAllCompleted();
    toast.info("Chamados concluídos movidos para o histórico.");
  };

  const handleCheckIn = () => {
    if (!timerStoreId) {
      toast.error("Selecione uma loja para iniciar o check-in.");
      return;
    }

    const hasOpenCall = openCalls.some(
      (call) => call.codigoLoja === timerStoreId
    );
    if (!hasOpenCall) {
      toast.error("Nenhum chamado ativo para esta loja.");
      return;
    }

    const record = storeTimers[timerStoreId];
    if (record?.timeStarted) {
      toast.info("Já existe um check-in em andamento para esta loja.");
      return;
    }

    const startedAt = startTimer();
    startStoreTimer(timerStoreId, startedAt);
    toast.success(`Check-in iniciado na loja ${timerStoreId}.`);
  };

  const handleCheckOut = () => {
    if (!timerStoreId) {
      toast.error("Selecione uma loja para encerrar o check-in.");
      return;
    }

    const record = storeTimers[timerStoreId];
    if (!record || !record.timeStarted) {
      toast.info("Nenhum check-in ativo para esta loja.");
      return;
    }

    const minutes = stopTimer();
    stopStoreTimer(timerStoreId, minutes);
    toast.success(
      minutes
        ? `Check-out registrado na loja ${timerStoreId} (+${minutes} min).`
        : `Check-out registrado na loja ${timerStoreId}.`
    );
  };

  const handleTimerReset = () => {
    if (timerStoreId) {
      resetStoreTimer(timerStoreId);
      toast.info(`Tempo da loja ${timerStoreId} zerado.`);
    } else {
      toast.info("Timer zerado.");
    }
    resetTimer();
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-primary px-4 py-8 pt-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="rounded-2xl bg-secondary p-3 shadow-glow">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestão de Atendimento em Campo
            </h1>
            <p className="text-muted-foreground">
              Controle chamados, mídias obrigatórias e previsão de faturamento
              em um só lugar.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <Card className="border-border bg-background/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Plus className="h-5 w-5" /> Abrir novo atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <Label htmlFor="codigoLoja">Código da Loja</Label>
                    <Input
                      id="codigoLoja"
                      placeholder="Ex: 1234"
                      value={codigoLoja}
                      onChange={(e) => setCodigoLoja(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fsa">FSA</Label>
                    <Input
                      id="fsa"
                      placeholder="Ex: FSA1234"
                      value={fsa}
                      onChange={(e) => setFsa(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pdv">PDV (opcional)</Label>
                    <Input
                      id="pdv"
                      placeholder="Ex: 301"
                      value={pdv}
                      onChange={(e) => setPdv(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddCall} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> Adicionar atendimento
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-background/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" /> Timer de atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <Label>Selecionar loja</Label>
                    <Select
                      value={timerStoreId}
                      onValueChange={setTimerStoreId}
                      disabled={availableStoreOptions.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhuma loja em atendimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStoreOptions.map((storeCode) => (
                          <SelectItem key={storeCode} value={storeCode}>
                            Loja {storeCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Tempo em curso
                    </p>
                    <p className="font-mono text-3xl font-bold text-foreground">
                      {timeDisplay}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total acumulado na loja: {formatMinutes(selectedStoreMinutes)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCheckIn} className="gap-2">
                      <Play className="h-4 w-4" /> Check-in
                    </Button>
                    <Button
                      onClick={handleCheckOut}
                      variant="secondary"
                      className="gap-2"
                    >
                      <Pause className="h-4 w-4" /> Check-out
                    </Button>
                    <Button
                      onClick={handleTimerReset}
                      variant="outline"
                      className="gap-2"
                    >
                      <RefreshCcw className="h-4 w-4" /> Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/50 bg-background/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <DollarSign className="h-5 w-5" /> Previsão de faturamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-foreground">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Chamados ativos
                    </p>
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
                      Valores adicionais por hora excedente (R$ 20,00) são aplicáveis após 120 minutos.
                    </p>
                    <Button
                      onClick={handleArchiveCompleted}
                      variant="secondary"
                      className="w-full gap-2"
                      disabled={completedPending.length === 0}
                    >
                      <Archive className="h-4 w-4" /> Arquivar concluídos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border bg-background/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <ClipboardList className="h-5 w-5" /> Chamados em andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeCalls.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Nenhum chamado ativo no momento. Abra um novo atendimento para começar.
                    </div>
                  ) : (
                    <ScrollArea className="h-[520px] pr-4">
                      <div className="space-y-4">
                        {activeCalls.map((call) => (
                          <ActiveCallCard
                            key={call.id}
                            call={call}
                            storeRecord={storeTimers[call.codigoLoja]}
                            storeMinutes={getStoreTotalMinutes(call.codigoLoja)}
                            onUploadMedia={(media, file) =>
                              handleMediaUpload(call.id, media, file)
                            }
                            onRemoveMedia={(media) =>
                              handleMediaRemove(call.id, media)
                            }
                            onComplete={() => handleComplete(call)}
                            onRemove={() => handleRemove(call.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-background/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Archive className="h-5 w-5" /> Histórico agrupado por dia/loja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupedHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum chamado concluído ou arquivado até o momento.
                    </p>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-2">
                      {groupedHistory.map((group) => (
                        <AccordionItem key={group.date} value={group.date}>
                          <AccordionTrigger className="text-left">
                            {formatDateLabel(group.date)}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              {group.stores.map((store) => (
                                <Card key={`${group.date}-${store.codigoLoja}`} className="border-dashed border-border bg-card/60">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">
                                      Loja {store.codigoLoja}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    {store.calls.map((call) => (
                                      <div
                                        key={call.id}
                                        className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2"
                                      >
                                        <div>
                                          <p className="font-medium text-foreground">
                                            FSA #{call.fsa}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Tempo total: {formatMinutes(call.timeTotalServiceMinutes)}
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="capitalize text-xs"
                                        >
                                          {statusLabel[call.status]}
                                        </Badge>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceManager;
