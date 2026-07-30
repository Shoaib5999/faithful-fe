import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CmsSlidersPanel } from "@/components/cms/CmsSlidersPanel";
import { CmsHomeImagesPanel } from "@/components/cms/CmsHomeImagesPanel";

const CmsPage: React.FC = () => {
  return (
    <PageWrapper>
      <PageHeader
        title="CMS"
        subtitle="Manage homepage content and section images"
      />

      <Tabs defaultValue="sliders" className="mt-4">
        <TabsList>
          <TabsTrigger value="sliders">Hero Slider</TabsTrigger>
          <TabsTrigger value="home-images">Section Images</TabsTrigger>
        </TabsList>

        <TabsContent value="sliders" className="mt-4">
          <CmsSlidersPanel />
        </TabsContent>

        <TabsContent value="home-images" className="mt-4">
          <CmsHomeImagesPanel />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
};

export default CmsPage;
