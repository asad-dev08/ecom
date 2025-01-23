import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { Loader } from "./Loader";

interface PageSection {
  id: string;
  title: string;
  content: string;
  image?: string;
}

interface PageData {
  title: string;
  content: string;
  meta_title?: string;
  meta_desc?: string;
  sections: PageSection[];
}

interface PageContentProps {
  slug: string;
}

export const PageContent: React.FC<PageContentProps> = ({ slug }) => {
  const { data: pageData, isLoading } = useQuery<PageData>({
    queryKey: ["page", slug],
    queryFn: async () => {
      const response = await api.get(`/pages/${slug}`);
      return response.data.data;
    },
  });

  if (isLoading) return <Loader />;
  if (!pageData) return <div>Page not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {pageData.title}
      </h1>

      {/* Main content */}
      <div
        className="prose max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: pageData.content }}
      />

      {/* Sections */}
      {pageData.sections.map((section) => (
        <div key={section.id} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {section.title}
          </h2>
          {section.image && (
            <img
              src={section.image}
              alt={section.title}
              className="w-full h-auto rounded-lg mb-6"
            />
          )}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </div>
      ))}
    </div>
  );
};
