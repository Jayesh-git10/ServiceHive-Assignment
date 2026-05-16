import { Request, Response } from 'express';
import Lead from '../models/Lead';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).optional(),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});

export const getLeads = async (req: Request, res: Response) => {
  try {
    const { status, source, search, sort = 'latest', page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = sort === 'latest' ? -1 : 1;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: sortOrder }).skip(skip).limit(Number(limit)),
      Lead.countDocuments(query)
    ]);

    res.json({
      leads,
      metadata: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const validatedData = leadSchema.parse(req.body);
    const lead = new Lead(validatedData);
    await lead.save();
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating lead' });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndUpdate(id, req.body, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: 'Error updating lead' });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting lead' });
  }
};

export const exportCSV = async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find();
    let csv = 'Name,Email,Status,Source,Created At\n';
    leads.forEach(lead => {
      csv += `"${lead.name}","${lead.email}","${lead.status}","${lead.source}","${lead.createdAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting CSV' });
  }
};
