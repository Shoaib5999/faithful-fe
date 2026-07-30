import { api } from "@/services/api";

export type FulfillShipmentResult = {
  shipmentId: string;
  awbCode: string;
  courierName: string | null;
  labelUrl: string | null;
  currentStatus: string | null;
};

export type TrackShipmentResult = {
  tracking: {
    awbCode: string | null;
    courierName: string | null;
    currentStatus: string | null;
    trackingUrl: string | null;
    lastUpdated: string;
  };
  statusSync?: { updated: boolean; status?: string };
};

export const createShiprocketOrder = (orderId: string): Promise<unknown> =>
  api.post("/shipping/create", { orderId });

export const fulfillShipment = (orderId: string, courierId?: string): Promise<FulfillShipmentResult> =>
  api.post<FulfillShipmentResult>("/shipping/fulfill", { orderId, courierId });

export const trackShipment = (orderId: string): Promise<TrackShipmentResult> =>
  api.get<TrackShipmentResult>(`/shipping/track/${orderId}`);

export const cancelShiprocketOrder = (orderId: string): Promise<unknown> =>
  api.delete(`/shipping/cancel/${orderId}`);
