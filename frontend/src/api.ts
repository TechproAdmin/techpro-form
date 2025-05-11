import type { PropertyData, KaitsukeFormData, NaikenFormData } from "@/types";
import type { SendApiResponse } from "@/types";

/*
在庫一覧取得のAPIはGASのエンドポイントで公開されている
GASスクリプト: https://script.google.com/d/1YihVIQXIwReSW7pTKiGUP4yb-axHG8P-9mJ2ZxsAgzvUe2vnphHBRgm8/edit?usp=sharing
*/

export class GasApiService {
  private static instance: GasApiService;
  private readonly API_URL = 'https://techpro-form-api-236032490225.asia-northeast1.run.app';

  private constructor() {}

  public static getInstance(): GasApiService {
    if (!GasApiService.instance) {
      GasApiService.instance = new GasApiService();
    }
    return GasApiService.instance;
  }

  public async fetchProperties(): Promise<PropertyData[]> {
    try {
      const fetch_api_url = this.API_URL + "/fetch";
      const response = await fetch(fetch_api_url);
      const data = await response.json();
      // 空のnoを持つ物件をフィルタリング
      return data.properties.filter((property: PropertyData) => property.no && property.no.trim() !== '');
    } catch (error) {
      console.error('物件データの取得に失敗しました:', error);
      return [];
    }
  }

  public async fetchPropertiesNaiken(): Promise<PropertyData[]> {
    try {
      const fetch_api_url = this.API_URL + "/fetch_naiken";
      const response = await fetch(fetch_api_url);
      const data = await response.json();
      return data.properties.filter((property: PropertyData) => property.no && property.no.trim() !== '');
    } catch (error) {
      console.error('物件データの取得に失敗しました:', error);
      return [];
    }
  }

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

      const send_api_url = this.API_URL + "/send_kaitsuke";

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

  public async sendNaikenFormData(data: NaikenFormData): Promise<SendApiResponse> {
    try {
      const payload = { 
        name: data.name,
        phone: data.phone,
        email: data.email,
        date1: data.date1,
        time1: data.time1,
        date2: data.date2,
        time2: data.time2,
        imgFile: data.imgFile,
        privacy: data.privacy,
        propertyNo: data.property.no,
        propertyAddress: data.property.address,
        propertyType: data.property.type,
        propertyPrice: data.property.price,
      }

      const send_api_url = this.API_URL + "/send_naiken";

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

}
