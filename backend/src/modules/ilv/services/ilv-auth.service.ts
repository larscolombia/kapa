import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IlbCloseToken } from '../../../database/entities/ilv-close-token.entity';
import { IlbTokenPayload } from '../interfaces';

@Injectable()
export class IlbAuthService {
  constructor(
    @InjectRepository(IlbCloseToken)
    private ilvCloseTokenRepo: Repository<IlbCloseToken>,
  ) {}

  async generateCloseToken(reportId: number, empresaId: number): Promise<string> {
    const jwtId = uuidv4();
    const expiresIn = 72 * 3600;
    const now = Math.floor(Date.now() / 1000);

    const payload: IlbTokenPayload = {
      jti: jwtId,
      rid: reportId,
      eid: empresaId,
      scope: 'close_ilv',
      iat: now,
      exp: now + expiresIn,
    };

    const secret = process.env.ILV_TOKEN_SECRET || process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn });

    await this.ilvCloseTokenRepo.save({
      report_id: reportId,
      empresa_id: empresaId,
      jwt_id: jwtId,
      expires_at: new Date((now + expiresIn) * 1000),
    });

    return token;
  }

  async verifyCloseToken(token: string): Promise<IlbTokenPayload> {
    try {
      const secret = process.env.ILV_TOKEN_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret) as IlbTokenPayload;

      const tokenRecord = await this.ilvCloseTokenRepo.findOne({
        where: { jwt_id: decoded.jti },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Token no válido');
      }

      if (tokenRecord.used_at) {
        throw new UnauthorizedException('Token ya fue utilizado');
      }

      if (new Date() > tokenRecord.expires_at) {
        throw new UnauthorizedException('Token expirado');
      }

      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async markTokenAsUsed(jwtId: string, ip: string, userAgent: string): Promise<void> {
    await this.ilvCloseTokenRepo.update(
      { jwt_id: jwtId },
      { used_at: new Date(), used_ip: ip, used_user_agent: userAgent },
    );
  }

  async invalidateReportTokens(reportId: number): Promise<void> {
    await this.ilvCloseTokenRepo.update(
      { report_id: reportId, used_at: null },
      { used_at: new Date() },
    );
  }
}
