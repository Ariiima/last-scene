import { ShowAnalyzer } from '@/components/ShowAnalyzer';

interface PageProps {
  params: {
    show: string;
  };
}

export default function AnalyzePage({ params }: PageProps) {
  const decodedShow = decodeURIComponent(params.show);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 radial-gradient bg-black">
      <div className="w-full max-w-2xl mx-4 sm:mx-auto bg-gray-900 bg-opacity-90 p-6 sm:p-12 rounded-xl shadow-2xl">
        <ShowAnalyzer show={decodedShow} />
      </div>
    </div>
  );
} 