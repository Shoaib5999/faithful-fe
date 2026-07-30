import type { HeroSlide, Slider, SliderApiRow, SlidersListApiData } from "@/types/cms.types";
import { parseSliderRow, toHeroSlides } from "@/lib/slider-utils";
import { api } from "@/services/api";

export const fetchSliders = async (): Promise<Slider[]> => {
  const data = await api.get<SlidersListApiData>("/cms/sliders");
  return (data.sliders ?? []).map(parseSliderRow);
};

export const fetchStorefrontSliders = async (): Promise<HeroSlide[]> => {
  const data = await api.get<SlidersListApiData>("/storefront/sliders");
  return toHeroSlides((data.sliders ?? []).map(parseSliderRow));
};

export const createSlider = async (input: Omit<Slider, "id">): Promise<Slider> => {
  const row = await api.post<SliderApiRow>("/cms/sliders", input);
  return parseSliderRow(row);
};

export const updateSlider = async (
  id: string,
  input: Partial<Omit<Slider, "id">>,
): Promise<Slider> => {
  const row = await api.put<SliderApiRow>(`/cms/sliders/${id}`, input);
  return parseSliderRow(row);
};

export const deleteSlider = async (id: string): Promise<void> => {
  await api.delete(`/cms/sliders/${id}`);
};

export const reorderSliders = async (orderedIds: string[]): Promise<Slider[]> => {
  const data = await api.put<SlidersListApiData>("/cms/sliders/reorder", { orderedIds });
  return (data.sliders ?? []).map(parseSliderRow);
};
