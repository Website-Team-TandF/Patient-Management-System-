import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Loader2, Thermometer, Pill, Stethoscope, Activity } from 'lucide-react';
import { getMetadata, updateMetadata, type Metadata } from '@/services/api';
import toast from 'react-hot-toast';

const MetadataManagement: React.FC = () => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inputs, setInputs] = useState({
    treatments: '',
    medicines: '',
    diseases: '',
    symptoms: ''
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const data = await getMetadata();
      setMetadata(data);
    } catch (error) {
      toast.error('Failed to load form settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (field: keyof Metadata) => {
    const value = inputs[field].trim();
    if (!value || !metadata) return;

    if (metadata[field].includes(value)) {
      toast.error('Item already exists');
      return;
    }

    setMetadata({
      ...metadata,
      [field]: [...metadata[field], value]
    });
    setInputs({ ...inputs, [field]: '' });
  };

  const handleRemove = (field: keyof Metadata, item: string) => {
    if (!metadata) return;
    setMetadata({
      ...metadata,
      [field]: metadata[field].filter(i => i !== item)
    });
  };

  const handleSave = async () => {
    if (!metadata) return;
    setSaving(true);
    try {
      await updateMetadata(metadata);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = [
    { id: 'diseases' as const, label: 'Common Diseases', icon: Stethoscope, color: 'text-blue-500' },
    { id: 'treatments' as const, label: 'Treatments', icon: Activity, color: 'text-green-500' },
    { id: 'medicines' as const, label: 'Medicines', icon: Pill, color: 'text-purple-500' },
    { id: 'symptoms' as const, label: 'Symptoms', icon: Thermometer, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Form Settings</h2>
          <p className="text-muted-foreground">Manage the options available in doctor consultation forms</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(({ id, label, icon: Icon, color }) => (
          <Card key={id} className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Add new ${label.toLowerCase()}...`}
                  value={inputs[id]}
                  onChange={(e) => setInputs({ ...inputs, [id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd(id)}
                />
                <Button variant="outline" size="icon" onClick={() => handleAdd(id)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[100px] p-3 rounded-lg bg-muted/30 border border-dashed">
                {metadata?.[id].map((item) => (
                  <Badge key={item} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2">
                    {item}
                    <button
                      onClick={() => handleRemove(id, item)}
                      className="hover:bg-destructive/10 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {metadata?.[id].length === 0 && (
                  <p className="text-xs text-muted-foreground italic m-auto">No items added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MetadataManagement;
