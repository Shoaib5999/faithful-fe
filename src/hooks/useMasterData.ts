import { useContext } from "react";
import { MasterDataContext } from "@/context/MasterDataContext";

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) throw new Error("useMasterData must be used within MasterDataProvider");
  return context;
};
