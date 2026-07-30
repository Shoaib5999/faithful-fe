import type { ContactSubjectId } from "@/components/storefront/ContactSubjectMenu";
import { storeApiFetch } from "@/services/store-api";

export type SubmitContactPayload = {
  name: string;
  email: string;
  subject: ContactSubjectId;
  message: string;
};

export const submitContactForm = async (
  payload: SubmitContactPayload,
): Promise<string> => {
  const { message } = await storeApiFetch("/contact", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      subject: payload.subject,
      message: payload.message.trim(),
    }),
  });

  return message;
};
