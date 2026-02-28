import { Request, Response } from "express";
import { Metadata } from "../models/Metadata";
import { Medicine } from "../models/Medicine";

export const getMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.query;
    let metadata = await Metadata.findOne();
    if (!metadata) {
      // Seed initial data if not found
      metadata = await Metadata.create({
        treatments: [
          "Nadi Pariksha",
          "Gastrointestinal Disorder",
          "Prakriti Parikshan",
          "Hair Fall",
          "Hypertension Problems",
          "Respiratory Disorders",
          "Urinary Disorders",
          "Joint Disorders",
          "Skin Disorder",
          "Eczema",
          "Fungal Infection",
          "Acne",
          "Vitiligo",
          "Diabetics",
        ],
        diseases: [
          "Diabetes",
          "Thyroid",
          "Joint Disorder",
          "Skin Disorder",
          "Hypertensions",
          "Digestive Problems",
          "Gynecological Problems",
          "Hair Fall Problems",
        ],
        medicines: [], // We will fetch this separately
        symptoms: [
          "Fever",
          "Cough",
          "Cold",
          "Pain",
          "Swelling",
          "Burning Sensation",
          "Itching",
          "Weakness",
        ],
      });
    }

    // Fetch unique medicine names from the Medicine collection
    const query: any = {};
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const medicines = await Medicine.distinct("name", query);
    
    // Convert to plain object to modify
    const metadataObj = metadata.toObject();
    metadataObj.medicines = medicines.length > 0 ? medicines : metadataObj.medicines;

    res.status(200).json({ success: true, data: metadataObj });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error fetching metadata", error: error.message });
  }
};

export const updateMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { treatments, medicines, diseases, symptoms } = req.body;
    let metadata = await Metadata.findOne();
    
    if (!metadata) {
      metadata = new Metadata({});
    }

    if (treatments) metadata.treatments = treatments;
    if (medicines) metadata.medicines = medicines;
    if (diseases) metadata.diseases = diseases;
    if (symptoms) metadata.symptoms = symptoms;

    await metadata.save();
    res.status(200).json({ success: true, message: "Metadata updated successfully", data: metadata });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error updating metadata", error: error.message });
  }
};
