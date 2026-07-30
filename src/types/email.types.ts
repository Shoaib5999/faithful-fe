export type EmailTrigger =
  | "order_placed"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "refund_initiated"
  | "refund_completed"
  | "customer_welcome"
  | "password_reset"
  | "low_stock_alert";

export interface EmailTemplate {
  id: string;
  triggerKey: EmailTrigger;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  lastEditedAt: string;
}
