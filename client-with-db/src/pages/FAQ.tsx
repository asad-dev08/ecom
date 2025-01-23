import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { Loader } from "../components/common/Loader";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQ: React.FC = () => {
  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await api.get("/faqs");
      return response.data.data;
    },
  });

  if (isLoading) return <Loader />;

  // Group FAQs by category
  const groupedFaqs = faqs?.reduce((acc, faq) => {
    const category = faq.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Frequently Asked Questions
      </h1>

      {groupedFaqs &&
        Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {category}
            </h2>
            <div className="space-y-4">
              {categoryFaqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-white rounded-lg shadow-sm"
                >
                  <summary className="flex justify-between items-center cursor-pointer p-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {faq.question}
                    </h3>
                    <span className="ml-6 flex-shrink-0">
                      <svg
                        className="h-6 w-6 transform group-open:rotate-180 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};
