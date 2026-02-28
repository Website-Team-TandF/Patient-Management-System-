import { Medicine } from '../models/Medicine';
import { Types } from 'mongoose';

export interface CreateMedicineData {
  name: string;
  unit: 'gram' | 'ml';
  quantity: number;
  vendor: string;
  hospitalId: string;
  lowStockThreshold?: number;
}

export interface UpdateMedicineData {
  name?: string;
  unit?: 'gram' | 'ml';
  quantity?: number;
  vendor?: string;
  lowStockThreshold?: number;
}

/**
 * Get all medicines for a hospital
 */
export const getMedicinesByHospital = async (
  hospitalId: string,
  page: number = 1,
  limit: number = 50
) => {
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const skip = (page - 1) * limit;
  const hospitalObjectId = new Types.ObjectId(hospitalId);

  const medicines = await Medicine.find({ hospitalId: hospitalObjectId })
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 })
    .select('-__v');

  const total = await Medicine.countDocuments({ hospitalId: hospitalObjectId });

  return {
    data: medicines,
    total,
    page,
    limit
  };
};

/**
 * Get medicines with low stock for a hospital
 */
export const getLowStockMedicines = async (hospitalId: string) => {
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const hospitalObjectId = new Types.ObjectId(hospitalId);

  // Find medicines where quantity <= lowStockThreshold
  const lowStockMedicines = await Medicine.find({
    hospitalId: hospitalObjectId,
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
  })
    .sort({ quantity: 1 })
    .select('-__v');

  return lowStockMedicines;
};

/**
 * Create a new medicine
 */
export const createMedicine = async (data: CreateMedicineData) => {
  if (!Types.ObjectId.isValid(data.hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const medicine = new Medicine({
    name: data.name,
    unit: data.unit,
    quantity: data.quantity,
    vendor: data.vendor,
    hospitalId: new Types.ObjectId(data.hospitalId),
    lowStockThreshold: data.lowStockThreshold || 10
  });

  await medicine.save();
  return medicine;
};

/**
 * Update a medicine
 */
export const updateMedicine = async (medicineId: string, data: UpdateMedicineData) => {
  if (!Types.ObjectId.isValid(medicineId)) {
    throw new Error('Invalid medicine ID');
  }

  const medicine = await Medicine.findByIdAndUpdate(
    medicineId,
    { $set: data },
    { new: true }
  ).select('-__v');

  if (!medicine) {
    throw new Error('Medicine not found');
  }

  return medicine;
};

/**
 * Delete a medicine
 */
export const deleteMedicine = async (medicineId: string) => {
  if (!Types.ObjectId.isValid(medicineId)) {
    throw new Error('Invalid medicine ID');
  }

  const medicine = await Medicine.findByIdAndDelete(medicineId);

  if (!medicine) {
    throw new Error('Medicine not found');
  }

  return { success: true };
};

/**
 * Reduce medicine stock when dispensed
 */
export const reduceMedicineStock = async (
  hospitalId: string,
  medicineName: string,
  quantityToReduce: number
) => {
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const hospitalObjectId = new Types.ObjectId(hospitalId);

  const medicine = await Medicine.findOneAndUpdate(
    { 
      hospitalId: hospitalObjectId, 
      name: medicineName,
      quantity: { $gte: quantityToReduce } // Only reduce if enough stock
    },
    { $inc: { quantity: -quantityToReduce } },
    { new: true }
  );

  if (!medicine) {
    // Try to find if medicine exists but insufficient stock
    const existing = await Medicine.findOne({ 
      hospitalId: hospitalObjectId, 
      name: medicineName 
    });
    
    if (existing) {
      throw new Error(`Insufficient stock for ${medicineName}. Available: ${existing.quantity}`);
    }
    throw new Error(`Medicine ${medicineName} not found in inventory`);
  }

  return medicine;
};

/**
 * Get all medicine names for a hospital (for metadata/autocomplete)
 */
export const getMedicineNames = async (hospitalId: string): Promise<string[]> => {
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const hospitalObjectId = new Types.ObjectId(hospitalId);

  const medicines = await Medicine.find({ hospitalId: hospitalObjectId })
    .select('name')
    .sort({ name: 1 });

  return medicines.map(m => m.name);
};

/**
 * Search medicines by name
 */
export const searchMedicines = async (hospitalId: string, query: string) => {
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const hospitalObjectId = new Types.ObjectId(hospitalId);

  const medicines = await Medicine.find({
    hospitalId: hospitalObjectId,
    name: { $regex: query, $options: 'i' }
  })
    .limit(20)
    .select('-__v');

  return medicines;
};

/**
 * Bulk update stock (for when pharmacist dispenses multiple medicines)
 */
export const bulkReduceStock = async (
  hospitalId: string,
  items: Array<{ medicineName: string; quantity: number }>
) => {
  const results: Array<{ medicineName: string; success: boolean; error?: string }> = [];

  for (const item of items) {
    try {
      await reduceMedicineStock(hospitalId, item.medicineName, item.quantity);
      results.push({ medicineName: item.medicineName, success: true });
    } catch (error: any) {
      results.push({ 
        medicineName: item.medicineName, 
        success: false, 
        error: error.message 
      });
    }
  }

  return results;
};
