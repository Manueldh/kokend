'use client';

import { useUser } from "../../components/UserProvider";
import ProtectedRoute from "../../components/ProtectedRoute";
import UserPreferences from "../../components/UserPreferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User } from "lucide-react";

function VoorkeurenContent() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
          <Settings className="text-orange-600" />
          Mijn Voorkeuren
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Welkom, {user?.displayName || user?.username}!
        </p>
        <p className="text-gray-600">
          Stel je smaakvoorkeuren in om betere recepten te krijgen
        </p>
      </div>

      <UserPreferences />
    </div>
  );
}

export default function VoorkeurenPage() {
  return (
    <ProtectedRoute>
      <VoorkeurenContent />
    </ProtectedRoute>
  );
}