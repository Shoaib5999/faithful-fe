interface AppConfig {
  name: string;
  logoText: string;
  logoIcon: string;
  defaultPageSize: number;
  pageSizeOptions: number[];
  lowStockThreshold: number;
  sessionTokenKey: string;
  toastDuration: number;
  searchDebounceMs: number;
  sidebarWidthDesktop: string;
  sidebarWidthTablet: string;
  gstNumber?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export const APP_CONFIG: AppConfig = {
  name: "AdminPanel",
  logoText: "AP",
  logoIcon: "circle",
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50],
  lowStockThreshold: 5,
  sessionTokenKey: "admin_session",
  toastDuration: 4000,
  searchDebounceMs: 300,
  sidebarWidthDesktop: "240px",
  sidebarWidthTablet: "64px",
  gstNumber: "",
  receiptHeader: "Thank you for shopping with us!",
  receiptFooter: "Goods once sold will not be returned or exchanged.",
};
