
import { SettingsIcon } from "lucide-react";

const SettingsHeader = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center">
          <SettingsIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>
    </header>
  );
};

export default SettingsHeader;
