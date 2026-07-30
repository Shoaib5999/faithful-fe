import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/common/TagInput";
import type { ProductSEO } from "@/types/product-schema.types";

interface SEOFieldsProps {
  seo: ProductSEO;
  onChange: (seo: ProductSEO) => void;
}

export const SEOFields: React.FC<SEOFieldsProps> = ({ seo, onChange }) => {
  const update = (patch: Partial<ProductSEO>) => onChange({ ...seo, ...patch });

  const titleLen = seo.metaTitle.length;
  const descLen = seo.metaDescription.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <div className="flex items-center justify-between">
          <Label>Meta Title</Label>
          <span className={`text-xs ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>{titleLen}/60</span>
        </div>
        <Input
          value={seo.metaTitle}
          onChange={(e) => update({ metaTitle: e.target.value })}
          placeholder="SEO title shown in search results"
          maxLength={120}
        />
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <div className="flex items-center justify-between">
          <Label>Meta Description</Label>
          <span className={`text-xs ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>{descLen}/160</span>
        </div>
        <Textarea
          value={seo.metaDescription}
          onChange={(e) => update({ metaDescription: e.target.value })}
          placeholder="Brief description for search engine listings"
          rows={3}
          maxLength={300}
        />
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label>Meta Keywords</Label>
        <TagInput tags={seo.metaKeywords} onChange={(metaKeywords) => update({ metaKeywords })} placeholder="Add a keyword..." />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Canonical URL</Label>
        <Input
          value={seo.canonicalUrl ?? ""}
          onChange={(e) => update({ canonicalUrl: e.target.value || null })}
          placeholder="https://..."
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>OG Image URL</Label>
        <Input
          value={seo.ogImageUrl ?? ""}
          onChange={(e) => update({ ogImageUrl: e.target.value || null })}
          placeholder="https://..."
        />
      </div>
    </div>
  );
};
