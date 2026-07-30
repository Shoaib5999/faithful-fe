import { storeApiFetch } from "@/services/store-api";

export const subscribeNewsletter = async (email: string): Promise<string> => {
  const { message } = await storeApiFetch("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  return message;
};
