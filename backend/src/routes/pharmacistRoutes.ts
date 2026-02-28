import { Router } from 'express';
import * as pharmacistController from '../controllers/pharmacistController';

const router = Router();

// Visit related
router.get('/visit/search', pharmacistController.getVisitByToken);
router.get('/visit/search-optimized', pharmacistController.getOptimizedVisitByToken);
router.post('/give-medicine', pharmacistController.giveMedicines);

// Medicine management
router.get('/medicines', pharmacistController.getMedicines);
router.get('/medicines/names', pharmacistController.getMedicineNames);
router.get('/medicine/:id', pharmacistController.getMedicineById);
router.get('/medicines/detail', pharmacistController.getMedicineByExactName);
router.post('/medicines', pharmacistController.addMedicine);
router.post('/medicines/bulk', pharmacistController.bulkCreateMedicines);
router.put('/medicines/bulk', pharmacistController.bulkUpdateMedicines);
router.put('/medicines/:id', pharmacistController.updateMedicine);

export default router;
