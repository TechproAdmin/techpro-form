import type { PropertyData, KaitsukeFormData, NaikenFormData } from "@/types";
import type { SendApiResponse } from "@/types";

/*
在庫一覧取得のAPIはGASのエンドポイントで公開されている
GASスクリプト: https://script.google.com/d/1YihVIQXIwReSW7pTKiGUP4yb-axHG8P-9mJ2ZxsAgzvUe2vnphHBRgm8/edit?usp=sharing
*/

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

  // 在庫参照
  public async fetchProperties(): Promise<PropertyData[]> {
    try {
      const fetch_api_url = this.baseUrl + "/fetch";
      const response = await fetch(fetch_api_url);
      const data = await response.json();
      // 空のnoを持つ物件をフィルタリング
      return data.properties.filter((property: PropertyData) => property.no && property.no.trim() !== '');
    } catch (error) {
      console.error('物件データの取得に失敗しました:', error);
      return [];
    }
  }

  // 在庫参照(内見可のみ)
  public async fetchPropertiesNaiken(): Promise<PropertyData[]> {
    const response = await fetch(`${this.baseUrl}/fetch_naiken`);
    const data = await response.json();
    return data.properties;
  }

  // 買付フォーム送信
  public async sendKaitsukeFormData(data: KaitsukeFormData): Promise<SendApiResponse> {
    try {
      const payload = {
          lastName: data.lastName,
          firstName: data.firstName,
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          media: data.media,
          agentName: data.agentName,
          offerPrice: data.offerPrice,
          deposit: data.deposit,
          loan: data.loan,
          conditions: data.conditions,
          propertyNo: data.property.no,
          propertyAddress: data.property.address,
          propertyType: data.property.type,
          propertyPrice: data.property.price,
      }

      const send_api_url = this.baseUrl + "/send_kaitsuke";

      const response = await fetch(send_api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('フォームデータの送信に失敗しました:', error);
      return {
        status: 'error',
        message: 'フォームデータの送信に失敗しました'
      };
    }
  }

  // 内見フォーム送信
  public async sendNaikenFormData(formData: FormData): Promise<{ status: string; message?: string }> {
    const response = await fetch(`${this.baseUrl}/send_naiken`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  }

}
