import { Request, Response } from "express";
import Lead from "../models/Lead";

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, city, healthIssue } = req.body;
    const newLead = await Lead.create({
      name,
      email,
      phoneNumber,
      city,
      healthIssue,
    });
    res.status(201).json({ _id: newLead._id });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id).select(
      "name email phoneNumber city"
    );
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { isConverted } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isConverted },
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUnconvertedLeads = async (_req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oneDaysAgo = new Date();
    oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Find leads from last 7 days not converted
    const recentUnconverted = await Lead.find({
      createdAt: { $gte: sevenDaysAgo, $lte: oneDaysAgo },
      isConverted: false,
    }).sort({ createdAt: -1 });

    const results = [];

    // 2. Filter out those who have a converted lead in the last 30 days
    for (const lead of recentUnconverted) {
      const convertedMatch = await Lead.findOne({
        phoneNumber: lead.phoneNumber,
        isConverted: true,
        createdAt: { $gte: thirtyDaysAgo },
      });

      if (!convertedMatch) {
        results.push(lead);
      }
    }

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
