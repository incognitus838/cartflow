export type DeliveryZoneRecord = {
  id: string;
  name: string;
  fee: number;
  sortOrder: number;
  isActive: boolean;
};

export type DeliveryZonePublic = {
  id: string;
  name: string;
  fee: number;
};