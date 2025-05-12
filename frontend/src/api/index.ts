import type { PropertyData, NaikenFormData } from "@/types";

export class GasApiService {
    private static instance: GasApiService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    }

    public static getInstance(): GasApiService {
        if (!GasApiService.instance) {
            GasApiService.instance = new GasApiService();
        }
        return GasApiService.instance;
    }

    async fetchPropertiesNaiken(): Promise<PropertyData[]> {
        const response = await fetch(`${this.baseUrl}/fetch_naiken`);
        const data = await response.json();
        return data.properties;
    }

    async sendNaikenFormData(formData: FormData): Promise<{ status: string; message?: string }> {
        const response = await fetch(`${this.baseUrl}/send_naiken`, {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    }
} 