import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, exportCSV } from '../controllers/leads';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', authorize([UserRole.ADMIN]), deleteLead);
router.get('/export', exportCSV);

export default router;
