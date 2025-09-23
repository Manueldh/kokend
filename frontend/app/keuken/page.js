'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Settings, ChefHat } from "lucide-react";
import { useUser } from "../../components/UserProvider";
import ProtectedRoute from "../../components/ProtectedRoute";
import { apiUrl } from "../../lib/api";

function KeukenContent() {
  const { user } = useUser();
  const [keuken, setKeuken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplianceForm, setShowApplianceForm] = useState(false);
  const [showCookwareForm, setShowCookwareForm] = useState(false);
  
  // Form states
  const [newAppliance, setNewAppliance] = useState({
    name: '',
    type: '',
    capacity: '',
    wattage: '',
    settings: []
  });
  
  const [newCookware, setNewCookware] = useState({
    name: '',
    type: '',
    size: '',
    material: '',
    ovenSafe: false,
    maxTemp: ''
  });

  const applianceTypes = [
    'fornuis', 'oven', 'magnetron', 'airfryer', 'grill', 'steamer', 'andere'
  ];
  
  const cookwareTypes = [
    'pan', 'braadpan', 'steelpan', 'wok', 'ovenschaal', 'bakvorm', 'andere'
  ];
  
  const materials = [
    'roestvrij staal', 'anti-aanbak', 'gietijzer', 'keramiek', 'glas', 'andere'
  ];

  const fetchKeuken = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(apiUrl(`/api/kitchen/${user.id}`));
      if (response.ok) {
        const data = await response.json();
        setKeuken(data);
      } else if (response.status === 404) {
        // Geen keuken gevonden, maak een lege aan
        setKeuken({
          userId: user.id,
          name: 'Mijn Keuken',
          appliances: [],
          cookware: []
        });
      }
    } catch (error) {
      console.error('Error fetching kitchen:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchKeuken();
  }, [fetchKeuken]);

  const saveKeuken = async (updatedKeuken) => {
    try {
      const response = await fetch('http://localhost:3001/api/kitchen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedKeuken),
      });
      if (response.ok) {
        const data = await response.json();
        setKeuken(data);
      }
    } catch (error) {
      console.error('Error saving kitchen:', error);
    }
  };

  const addAppliance = () => {
    const updatedKeuken = {
      ...keuken,
      appliances: [...keuken.appliances, newAppliance]
    };
    saveKeuken(updatedKeuken);
    setNewAppliance({ name: '', type: '', capacity: '', wattage: '', settings: [] });
    setShowApplianceForm(false);
  };

  const addCookware = () => {
    const updatedKeuken = {
      ...keuken,
      cookware: [...keuken.cookware, newCookware]
    };
    saveKeuken(updatedKeuken);
    setNewCookware({ name: '', type: '', size: '', material: '', ovenSafe: false, maxTemp: '' });
    setShowCookwareForm(false);
  };

  const removeAppliance = (index) => {
    const updatedKeuken = {
      ...keuken,
      appliances: keuken.appliances.filter((_, i) => i !== index)
    };
    saveKeuken(updatedKeuken);
  };

  const removeCookware = (index) => {
    const updatedKeuken = {
      ...keuken,
      cookware: keuken.cookware.filter((_, i) => i !== index)
    };
    saveKeuken(updatedKeuken);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Keuken laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Mijn Keuken</h1>
        <p className="text-xl text-gray-600">
          Configureer je keukenapparatuur voor betere recepten
        </p>
      </div>

      {/* Apparaten Sectie */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <span>Keukenapparaten</span>
              </CardTitle>
              <CardDescription>
                Voeg je keukenapparaten toe zodat AI betere recepten kan maken
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowApplianceForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Apparaat toevoegen
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {showApplianceForm && (
            <div className="mb-6 p-4 border rounded-lg bg-orange-50">
              <h4 className="font-semibold mb-3">Nieuw apparaat toevoegen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Naam</Label>
                  <Input
                    value={newAppliance.name}
                    onChange={(e) => setNewAppliance({...newAppliance, name: e.target.value})}
                    placeholder="Bijvoorbeeld: Grote oven"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select onValueChange={(value) => setNewAppliance({...newAppliance, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {applianceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Capaciteit</Label>
                  <Input
                    value={newAppliance.capacity}
                    onChange={(e) => setNewAppliance({...newAppliance, capacity: e.target.value})}
                    placeholder="Bijvoorbeeld: 4 pitten, 25L"
                  />
                </div>
                <div>
                  <Label>Vermogen (Watt)</Label>
                  <Input
                    type="number"
                    value={newAppliance.wattage}
                    onChange={(e) => setNewAppliance({...newAppliance, wattage: e.target.value})}
                    placeholder="1500"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={addAppliance} disabled={!newAppliance.name || !newAppliance.type}>
                  Toevoegen
                </Button>
                <Button variant="outline" onClick={() => setShowApplianceForm(false)}>
                  Annuleren
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keuken?.appliances?.map((appliance, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{appliance.name}</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeAppliance(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="secondary" className="mb-2">{appliance.type}</Badge>
                {appliance.capacity && <p className="text-sm text-gray-600">Capaciteit: {appliance.capacity}</p>}
                {appliance.wattage && <p className="text-sm text-gray-600">Vermogen: {appliance.wattage}W</p>}
              </div>
            ))}
          </div>

          {keuken?.appliances?.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Nog geen apparaten toegevoegd
            </p>
          )}
        </CardContent>
      </Card>

      {/* Kookgerei Sectie */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                <span>Kookgerei</span>
              </CardTitle>
              <CardDescription>
                Voeg je pannen, schalen en ander kookgerei toe
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCookwareForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Kookgerei toevoegen
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {showCookwareForm && (
            <div className="mb-6 p-4 border rounded-lg bg-orange-50">
              <h4 className="font-semibold mb-3">Nieuw kookgerei toevoegen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Naam</Label>
                  <Input
                    value={newCookware.name}
                    onChange={(e) => setNewCookware({...newCookware, name: e.target.value})}
                    placeholder="Bijvoorbeeld: Grote braadpan"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select onValueChange={(value) => setNewCookware({...newCookware, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cookwareTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grootte</Label>
                  <Input
                    value={newCookware.size}
                    onChange={(e) => setNewCookware({...newCookware, size: e.target.value})}
                    placeholder="Bijvoorbeeld: 24cm, 2L"
                  />
                </div>
                <div>
                  <Label>Materiaal</Label>
                  <Select onValueChange={(value) => setNewCookware({...newCookware, material: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer materiaal" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(material => (
                        <SelectItem key={material} value={material}>{material}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={addCookware} disabled={!newCookware.name || !newCookware.type}>
                  Toevoegen
                </Button>
                <Button variant="outline" onClick={() => setShowCookwareForm(false)}>
                  Annuleren
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keuken?.cookware?.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{item.name}</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeCookware(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="secondary" className="mb-2">{item.type}</Badge>
                {item.size && <p className="text-sm text-gray-600">Grootte: {item.size}</p>}
                {item.material && <p className="text-sm text-gray-600">Materiaal: {item.material}</p>}
                {item.ovenSafe && <Badge variant="outline" className="mt-1">Ovenveilig</Badge>}
              </div>
            ))}
          </div>

          {keuken?.cookware?.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Nog geen kookgerei toegevoegd
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function KeukenPage() {
  return (
    <ProtectedRoute>
      <KeukenContent />
    </ProtectedRoute>
  );
}
