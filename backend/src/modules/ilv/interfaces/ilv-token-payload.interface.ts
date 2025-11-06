export interface IlvTokenPayload {
  jti: string;         // JWT ID (UUID)
  rid: number;         // Report ID
  eid: number;         // Empresa ID
  scope: string;       // 'close_ilv'
  iat: number;         // Issued At
  exp: number;         // Expiration
}
