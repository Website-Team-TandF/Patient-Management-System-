import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit, Loader2, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { getMedicinesList, bulkCreateMedicines, bulkUpdateMedicines, type Medicine } from '@/services/api';
import toast from 'react-hot-toast';

import { useMedicineContext } from '@/context/MedicineContext';

const BulkUpdateTab: React.FC = () => {
  const { refreshMedicines } = useMedicineContext();
  const [mode, setMode] = useState<'selection' | 'create' | 'update'>('selection');

  // Create Mode State
  const [createRows, setCreateRows] = useState<Partial<Medicine>[]>([{ name: '', quantity: 1, lowStockThreshold: 0 }]);
  
  // Update Mode State
  const [updateRows, setUpdateRows] = useState<Medicine[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [saving, setSaving] = useState(false);

  // Load initial data for update mode
  useEffect(() => {
    if (mode === 'update') {
      fetchMoreMedicines(1, true);
    }
  }, [mode]);

  const fetchMoreMedicines = async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const data = await getMedicinesList(pageNum, 10);
      if (reset) {
        setUpdateRows(data.medicines);
      } else {
        setUpdateRows(prev => [...prev, ...data.medicines]);
      }
      setHasMore(pageNum < data.pages);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchMoreMedicines(page + 1);
  };

  // --- Create Handlers ---
  const addCreateRow = () => {
    setCreateRows([...createRows, { name: '', quantity: 1, lowStockThreshold: 0 }]);
  };

  const removeCreateRow = (index: number) => {
    if (createRows.length === 1) return;
    setCreateRows(createRows.filter((_, i) => i !== index));
  };

  const updateCreateRow = (index: number, field: keyof Medicine, value: any) => {
    const updated = [...createRows];
    updated[index] = { ...updated[index], [field]: value };
    setCreateRows(updated);
  };

  const saveBulkCreate = async () => {
    const invalid = createRows.some(r => !r.name || r.quantity === undefined || r.lowStockThreshold === undefined);
    if (invalid) {
      toast.error('Please fill all fields');
      return;
    }

    setSaving(true);
    try {
      await bulkCreateMedicines(createRows);
      toast.success(`${createRows.length} medicines created successfully`);
      setCreateRows([{ name: '', quantity: 1, lowStockThreshold: 0 }]);
      refreshMedicines(); // Refresh context after adding new medicines
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create medicines');
    } finally {
      setSaving(false);
    }
  };

  // --- Update Handlers ---
  const updateUpdateRow = (id: string, field: keyof Medicine, value: any) => {
    setUpdateRows(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const saveBulkUpdate = async () => {
    setSaving(true);
    try {
      await bulkUpdateMedicines(updateRows);
      toast.success('Medicines updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update medicines');
    } finally {
      setSaving(false);
    }
  };

  if (mode === 'selection') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[50vh] place-items-center">
        <Card className="w-full max-w-sm hover:border-primary/50 cursor-pointer transition-all hover:scale-105" onClick={() => setMode('create')}>
          <CardHeader className="text-center">
             <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
               <Plus className="h-8 w-8 text-green-600" />
             </div>
             <CardTitle>Bulk Create</CardTitle>
             <CardDescription>Add multiple new medicines at once</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="w-full max-w-sm hover:border-primary/50 cursor-pointer transition-all hover:scale-105" onClick={() => setMode('update')}>
          <CardHeader className="text-center">
             <div className="mx-auto bg-blue-100 p-4 rounded-full mb-4">
               <Edit className="h-8 w-8 text-blue-600" />
             </div>
             <CardTitle>Bulk Update</CardTitle>
             <CardDescription>Edit existing stock and thresholds</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setMode('selection')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-xl font-semibold">
          {mode === 'create' ? 'Bulk Create Medicines' : 'Bulk Update Inventory'}
        </h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Medicine List</CardTitle>
          <div className="flex gap-2">
            {mode === 'create' ? (
              <Button size="sm" variant="outline" onClick={addCreateRow}>
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
            ) : (
               <Button 
                size="sm" 
                variant={isEditing ? 'destructive' : 'outline'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? 'Cancel Edit' : 'Edit All'}
              </Button>
            )}
            
            <Button onClick={mode === 'create' ? saveBulkCreate : saveBulkUpdate} disabled={saving || (mode === 'update' && !isEditing)}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead className="w-[150px]">Quantity</TableHead>
                <TableHead className="w-[150px]">Threshold</TableHead>
                {mode === 'create' && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mode === 'create' ? (
                createRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input 
                        placeholder="Name" 
                        value={row.name} 
                        onChange={(e) => updateCreateRow(index, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="1"
                        value={row.quantity} 
                        onChange={(e) => updateCreateRow(index, 'quantity', parseInt(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        value={row.lowStockThreshold} 
                        onChange={(e) => updateCreateRow(index, 'lowStockThreshold', parseInt(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeCreateRow(index)}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                updateRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {isEditing ? (
                         <Input 
                           value={row.name} 
                           onChange={(e) => updateUpdateRow(row.id, 'name', e.target.value)}
                         />
                      ) : (
                        <span className="font-medium">{row.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input 
                          type="number" 
                          value={row.quantity} 
                          onChange={(e) => updateUpdateRow(row.id, 'quantity', parseInt(e.target.value))}
                        />
                      ) : (
                        row.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input 
                          type="number" 
                          value={row.lowStockThreshold} 
                          onChange={(e) => updateUpdateRow(row.id, 'lowStockThreshold', parseInt(e.target.value))}
                        />
                      ) : (
                        row.lowStockThreshold
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {mode === 'update' && hasMore && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpdateTab;
