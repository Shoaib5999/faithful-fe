import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEmailTemplate } from "@/hooks/useEmailTemplate";
import { SAMPLE_VARIABLE_VALUES } from "@/services/email-service";
import { formatDate } from "@/lib/formatters";
import { Mail, Copy, Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTriggerName = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const EmailPage: React.FC = () => {
  const { templates, selectedTemplate, handleSelect, handleUpdate, handleSendTest } = useEmailTemplate();
  const [localSubject, setLocalSubject] = useState("");
  const [localBody, setLocalBody] = useState("");
  const [localIsActive, setLocalIsActive] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [initialized, setInitialized] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedTemplate && selectedTemplate.id !== initialized) {
      setLocalSubject(selectedTemplate.subject);
      setLocalBody(selectedTemplate.body);
      setLocalIsActive(selectedTemplate.isActive);
      setInitialized(selectedTemplate.id);
    }
  }, [selectedTemplate, initialized]);

  const copyVariable = (token: string) => {
    const fullToken = `{{${token}}}`;
    navigator.clipboard.writeText(fullToken);
    setCopiedVar(token);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const previewBody = localBody.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_VARIABLE_VALUES[key] ?? `{{${key}}}`);
  const previewSubject = localSubject.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_VARIABLE_VALUES[key] ?? `{{${key}}}`);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    await handleUpdate(selectedTemplate.id, { subject: localSubject, body: localBody, isActive: localIsActive });
  };

  const handleTest = async () => {
    if (!selectedTemplate || !testEmail) return;
    setIsSending(true);
    await handleSendTest(selectedTemplate.id, testEmail);
    setIsSending(false);
  };

  return (
    <PageWrapper>
      <PageHeader title="Email Templates" subtitle="Manage notification email templates" />

      <div className="mt-4 flex flex-col lg:flex-row gap-6">
        
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {templates.map((t) => (
              <Button
                key={t.id}
                variant={selectedTemplate?.id === t.id ? "default" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => { handleSelect(t.id); setInitialized(null); }}
              >
                {formatTriggerName(t.triggerKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block w-72 shrink-0">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => { handleSelect(t.id); setInitialized(null); }}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                  selectedTemplate?.id === t.id
                    ? "bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <span className="text-sm font-medium">{formatTriggerName(t.triggerKey)}</span>
                <span className="text-xs text-muted-foreground truncate">{t.subject}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={t.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {t.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{formatDate(t.lastEditedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        
        <div className="flex-1 min-w-0">
          {!selectedTemplate ? (
            <EmptyState title="Select a template" description="Choose an email template to edit" icon={Mail} />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label>Subject</Label>
                <Input value={localSubject} onChange={(e) => setLocalSubject(e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v) => (
                    <Tooltip key={v}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className=" text-xs h-7"
                          onClick={() => copyVariable(v)}
                        >
                          {`{{${v}}}`}
                          {copiedVar === v ? <Check className="ml-1 h-3 w-3 text-green-500" /> : <Copy className="ml-1 h-3 w-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{copiedVar === v ? "Copied!" : "Click to copy"}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Body</Label>
                <Textarea
                  value={localBody}
                  onChange={(e) => setLocalBody(e.target.value)}
                  rows={16}
                  className=" text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={localIsActive} onCheckedChange={setLocalIsActive} />
                <Label>Active</Label>
              </div>

              <SectionCard title="Preview">
                <Card>
                  <CardContent className="pt-4">
                    <div className="font-bold mb-2">{previewSubject}</div>
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground">{previewBody}</div>
                  </CardContent>
                </Card>
              </SectionCard>

              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 flex flex-col gap-1">
                  <Label>Test Email</Label>
                  <div className="flex gap-2">
                    <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test@example.com" />
                    <Button variant="outline" onClick={handleTest} disabled={!testEmail || isSending}>
                      <Send className="mr-1 h-4 w-4" /> Send Test
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave}>Save Template</Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default EmailPage;
