import { Request, Response } from 'express';
import { AuthService } from '../../domain/services/AuthService';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { cedula } = req.body;
      if (!cedula) return res.status(400).json({ message: 'Cedula requerida' });
      const emp = await this.authService.loginByCedula(cedula);
      return res.json(emp);
    } catch (err: any) {
      return res.status(401).json({ message: err.message || 'No autorizado' });
    }
  };
}
