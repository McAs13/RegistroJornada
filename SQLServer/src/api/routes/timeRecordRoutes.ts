import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { TimeRecordController } from '../controllers/TimeRecordController';
import container from '../serverContainer';

const router = Router();
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const controller = new TimeRecordController(container.timeRecordService);

router.get('/', controller.list);
router.post('/', upload.single('photo'), controller.create);

export default router;
