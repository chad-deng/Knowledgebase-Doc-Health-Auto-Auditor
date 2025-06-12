import ArchitectureDiagram from '@/components/ArchitectureDiagram';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Architecture</h1>
          <p className="text-gray-600">
            Interactive view of the StoreHub Knowledge Base Auditor system components and their relationships.
            Click on any component to view detailed information and real-time status.
          </p>
        </div>
        
        <ArchitectureDiagram />
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Component Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Frontend Layer</h4>
              <p className="text-sm text-gray-600 mt-1">
                Next.js 14 with React and TypeScript providing the user interface and client-side functionality.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Backend API</h4>
              <p className="text-sm text-gray-600 mt-1">
                Express.js REST API handling business logic, data management, and external service integration.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">Rules Engine</h4>
              <p className="text-sm text-gray-600 mt-1">
                Content auditing service with configurable rules for quality assessment and issue detection.
              </p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-medium text-gray-900">AI Service</h4>
              <p className="text-sm text-gray-600 mt-1">
                Google Gemini integration providing intelligent content suggestions and analysis.
              </p>
            </div>
            
            <div className="border-l-4 border-gray-500 pl-4">
              <h4 className="font-medium text-gray-900">Data Store</h4>
              <p className="text-sm text-gray-600 mt-1">
                Knowledge base articles storage with metadata and version management.
              </p>
            </div>
            
            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="font-medium text-gray-900">External APIs</h4>
              <p className="text-sm text-gray-600 mt-1">
                Third-party services including Google Gemini AI for advanced content processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 