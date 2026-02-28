import React, { useState, useEffect } from 'react';
import { type Hospital } from '../../../services/mocks/hospitalData';
import { createHospital, updateHospital } from '../../../services/api';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HospitalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hospitalToEdit?: Hospital | null;
}

const HospitalFormModal: React.FC<HospitalFormModalProps> = ({ isOpen, onClose, onSuccess, hospitalToEdit }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hospitalToEdit) {
      setName(hospitalToEdit.name);
      setCity(hospitalToEdit.city);
    } else {
      setName('');
      setCity('');
    }
  }, [hospitalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (hospitalToEdit) {
        await updateHospital(hospitalToEdit.id, { name, city });
        toast.success('Hospital updated successfully');
      } else {
        await createHospital({ name, city });
        toast.success('Hospital created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{hospitalToEdit ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle>
          <DialogDescription>
            {hospitalToEdit ? 'Make changes to the hospital details here.' : 'Add a new hospital to your network.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalFormModal;
