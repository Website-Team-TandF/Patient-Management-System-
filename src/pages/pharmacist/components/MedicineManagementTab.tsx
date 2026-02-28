import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Edit2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { 
  getMedicinesList,
  getMedicineNames, 
  getMedicineById,
  addMedicine, 
  updateMedicine, 
  type Medicine 
} from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface MedicineManagementTabProps {
  hospitalId: string;
}

import { useMedicineContext } from '@/context/MedicineContext';

const MedicineManagementTab: React.FC<MedicineManagementTabProps> = ({ hospitalId }) => {
  // Browse Mode State
  const [paginatedMedicines, setPaginatedMedicines] = useState<Medicine[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search Mode State
  const { medicineNames: allMedicineNames, refreshMedicines } = useMedicineContext();
  const [filteredResults, setFilteredResults] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [tempDetails, setTempDetails] = useState<Record<string, Medicine>>({});
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    lowStockThreshold: 0
  });
  const [saving, setSaving] = useState(false);

  // Load paginated data when page changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchPaginatedMedicines();
    }
  }, [page]);

  // Initial load: Only load paginated data. Context handles names.
  useEffect(() => {
    fetchPaginatedMedicines();
  }, []);

  // Debounced search (0.75s)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        // Clear previous temp details when search changes
        setTempDetails({});
        const filtered = allMedicineNames.filter(m => 
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredResults(filtered.map(m => ({ id: m.id, name: m.name }))); // Ensure only name-only items
      } else {
        setIsSearching(false);
        setTempDetails({});
      }
    }, 750);

    return () => clearTimeout(timer);
  }, [searchQuery, allMedicineNames]);

  const fetchPaginatedMedicines = async () => {
    setLoading(true);
    try {
      const data = await getMedicinesList(page, 10);
      setPaginatedMedicines(data.medicines);
      setTotalPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicineDetail = async (id: string) => {
    try {
      const detail = await getMedicineById(id);
      setTempDetails(prev => ({ ...prev, [id]: detail }));
    } catch (err) {
      toast.error('Failed to fetch details');
    }
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      quantity: 1,
      lowStockThreshold: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      quantity: medicine.quantity || 0,
      lowStockThreshold: medicine.lowStockThreshold || 0
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    if (formData.lowStockThreshold > formData.quantity) {
      toast.error('Low stock threshold cannot be greater than quantity');
      return;
    }

    setSaving(true);
    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, formData);
        toast.success('Medicine updated');
        
        // Update temp details if they exist
        setTempDetails(prev => ({
          ...prev,
          [editingMedicine.id]: { ...prev[editingMedicine.id], ...formData }
        }));
        
        // Refresh context if name changed
        if (editingMedicine.name !== formData.name) {
          refreshMedicines();
        }

      } else {
        await addMedicine(formData);
        toast.success('Medicine added');
        refreshMedicines(); // Refresh the context list
      }
      setIsModalOpen(false);
      fetchPaginatedMedicines(); // Refresh the browse list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input 
            placeholder="Search medicine..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" /> Add Medicine
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>
            {isSearching ? 'Search results (local)' : 'All medicines (paginated)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !isSearching ? (
             <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Current Qty</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isSearching ? filteredResults : paginatedMedicines).map((m) => {
                    // If searching, we check tempDetails for full info
                    const detail = isSearching ? tempDetails[m.id] : m;
                    const hasDetail = detail && detail.quantity !== undefined;

                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>{hasDetail ? detail.quantity : '—'}</TableCell>
                        <TableCell>{hasDetail ? detail.lowStockThreshold : '—'}</TableCell>
                        <TableCell>
                          {hasDetail ? (
                            detail.quantity! <= detail.lowStockThreshold! ? (
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                <AlertCircle className="h-3 w-3" /> Low Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">In Stock</Badge>
                            )
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {!hasDetail ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => fetchMedicineDetail(m.id)}
                              className="text-xs"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> View Details
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(detail)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(isSearching ? filteredResults : paginatedMedicines).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No medicines found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {!isSearching ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Found {filteredResults.length} matches in local list
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
            <DialogDescription>
              Enter medicine details. Threshold must be less than current quantity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Medicine Name</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Medicine name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" 
                  min="1"
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Threshold Quantity</label>
                <Input 
                  type="number" 
                  min="0"
                  value={formData.lowStockThreshold} 
                  onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicineManagementTab;
