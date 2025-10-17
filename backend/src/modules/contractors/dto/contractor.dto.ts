export class ContractorDto {
    contractor_id: number;
    nit: string;
    name: string;
    resident_engineer: string;
    coordinator: string;
    phone?: string;
    parent_contractor?: number;
    state: string;
    emails: string[];
    projectIds: number[]
}
