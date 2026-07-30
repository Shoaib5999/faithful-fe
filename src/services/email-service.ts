import type { EmailTemplate, EmailTrigger } from "@/types/email.types";
import { generateId } from "@/lib/formatters";

const DEFAULT_TEMPLATES: Omit<EmailTemplate, "id" | "lastEditedAt">[] = [
  {
    triggerKey: "order_placed",
    name: "Order Placed",
    subject: "Your order {{order_id}} has been placed",
    body: "Hi {{customer_name}},\n\nThank you for your order! Your order {{order_id}} has been placed successfully.\n\nOrder Total: {{order_total}}\n\nWe will notify you once your order is confirmed.\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "order_id", "order_total", "store_name", "order_date"],
    isActive: true,
  },
  {
    triggerKey: "order_confirmed",
    name: "Order Confirmed",
    subject: "Your order {{order_id}} has been confirmed",
    body: "Hi {{customer_name}},\n\nGreat news! Your order {{order_id}} has been confirmed and is being prepared.\n\nOrder Total: {{order_total}}\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "order_id", "order_total", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "order_shipped",
    name: "Order Shipped",
    subject: "Your order {{order_id}} has been shipped",
    body: "Hi {{customer_name}},\n\nYour order {{order_id}} has been shipped!\n\nTracking Number: {{tracking_number}}\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "order_id", "tracking_number", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "order_delivered",
    name: "Order Delivered",
    subject: "Your order {{order_id}} has been delivered",
    body: "Hi {{customer_name}},\n\nYour order {{order_id}} has been delivered successfully.\n\nWe hope you enjoy your purchase!\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "order_id", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "order_cancelled",
    name: "Order Cancelled",
    subject: "Your order {{order_id}} has been cancelled",
    body: "Hi {{customer_name}},\n\nYour order {{order_id}} has been cancelled.\n\nReason: {{cancellation_reason}}\n\nIf you have any questions, please contact us.\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "order_id", "cancellation_reason", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "refund_initiated",
    name: "Refund Initiated",
    subject: "Refund initiated for order {{order_id}}",
    body: "Hi {{customer_name}},\n\nA refund of {{refund_amount}} has been initiated for your order {{order_id}}.\n\nPlease allow 5-7 business days for the refund to reflect.\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "order_id", "refund_amount", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "refund_completed",
    name: "Refund Completed",
    subject: "Refund completed for order {{order_id}}",
    body: "Hi {{customer_name}},\n\nYour refund of {{refund_amount}} for order {{order_id}} has been completed.\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "order_id", "refund_amount", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "customer_welcome",
    name: "Customer Welcome",
    subject: "Welcome to {{store_name}}, {{customer_name}}!",
    body: "Hi {{customer_name}},\n\nWelcome to {{store_name}}! We're excited to have you.\n\nExplore our products and enjoy shopping with us.\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "password_reset",
    name: "Password Reset",
    subject: "Reset your password",
    body: "Hi {{customer_name}},\n\nWe received a request to reset your password.\n\nClick the link below to set a new password:\n{{reset_link}}\n\nIf you didn't request this, please ignore this email.\n\nThank you,\n{{store_name}}",
    variables: ["customer_name", "reset_link", "store_name"],
    isActive: true,
  },
  {
    triggerKey: "low_stock_alert",
    name: "Low Stock Alert",
    subject: "Low stock alert: {{product_name}}",
    body: "Attention,\n\nThe following product is running low on stock:\n\nProduct: {{product_name}}\nSKU: {{product_sku}}\nCurrent Stock: {{current_stock}}\nThreshold: {{threshold}}\n\nPlease restock as soon as possible.\n\n{{store_name}}",
    variables: ["product_name", "product_sku", "current_stock", "threshold", "store_name"],
    isActive: true,
  },
];

let templates: EmailTemplate[] = DEFAULT_TEMPLATES.map((t) => ({
  ...t,
  id: generateId(),
  lastEditedAt: new Date().toISOString(),
}));

export const fetchTemplates = (): Promise<EmailTemplate[]> => Promise.resolve([...templates]);

export const updateTemplate = (id: string, input: Partial<Omit<EmailTemplate, "id" | "triggerKey" | "variables">>): Promise<EmailTemplate> => {
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return Promise.reject(new Error("Not found"));
  templates[idx] = { ...templates[idx], ...input, lastEditedAt: new Date().toISOString() };
  return Promise.resolve(templates[idx]);
};

export const sendTestEmail = (templateId: string, recipientEmail: string): Promise<{ success: boolean }> => {
  const template = templates.find((t) => t.id === templateId);
  if (!template) return Promise.reject(new Error("Template not found"));
  console.log(`[Email Test] Sending "${template.subject}" to ${recipientEmail}`);
  return Promise.resolve({ success: true });
};

export const SAMPLE_VARIABLE_VALUES: Record<string, string> = {
  customer_name: "John Doe",
  order_id: "ORD-1234",
  order_total: "₹1,499.00",
  store_name: "Faithful Meat",
  order_date: "Jan 15, 2026",
  tracking_number: "TRK-987654321",
  cancellation_reason: "Customer request",
  refund_amount: "₹499.00",
  reset_link: "https://example.com/reset/abc123",
  product_name: "Wireless Headphones",
  product_sku: "WH-001",
  current_stock: "3",
  threshold: "5",
};
