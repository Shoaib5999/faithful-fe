import { useState, useCallback } from "react";
import type { EmailTemplate } from "@/types/email.types";
import { useNotification } from "@/hooks/useNotification";
import { fetchTemplates, updateTemplate, sendTestEmail } from "@/services/email-service";
import React from "react";

export const useEmailTemplate = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();

  React.useEffect(() => {
    fetchTemplates().then((t) => {
      setTemplates(t);
      setIsLoading(false);
    });
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  const handleSelect = useCallback((id: string) => {
    setSelectedTemplateId(id);
  }, []);

  const handleUpdate = useCallback(async (id: string, input: Partial<Omit<EmailTemplate, "id" | "triggerKey" | "variables">>) => {
    const t = await updateTemplate(id, input);
    setTemplates((prev) => prev.map((x) => (x.id === id ? t : x)));
    notify("Template updated", "success");
  }, [notify]);

  const handleSendTest = useCallback(async (templateId: string, recipientEmail: string) => {
    await sendTestEmail(templateId, recipientEmail);
    notify("Test email sent (simulated)", "success");
  }, [notify]);

  return { templates, selectedTemplateId, selectedTemplate, isLoading, handleSelect, handleUpdate, handleSendTest };
};
