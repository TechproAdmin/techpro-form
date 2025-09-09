/**
 * GASで公開しているAPIを呼び出す
 * 1. 在庫一覧表参照
 * 2. 買付フォーム送信
 * 3. 内見フォーム送信
 * 4. CAフォーム送信
 */

import { 
    PropertyData, 
    SendApiResponse, 
    KaitsukeFormData, 
    NaikenFormData, 
    CAFormData 
} from "./types";


const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwHBRUlauSxej0E5Xbg7oVRiZO3tLVYbTKdM1LIr2vITaPVTDQGq0E3K9UQ7txZUM6X/exec'

export class GasApiService {
    private static instance: GasApiService;
    private baseUrl: string = GAS_API_URL;

    private constructor() {
    this.baseUrl = GAS_API_URL;
    }

    public static getInstance(): GasApiService {
    if (!GasApiService.instance) {
        GasApiService.instance = new GasApiService();
    }
    return GasApiService.instance;
    }

    // ファイルをBase64エンコードし、MIMEタイプも取得
    private async fileToBase64(file: File): Promise<{base64: string, mimeType: string}> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // data:image/jpeg;base64, の部分を除去してbase64部分のみを取得
                const base64 = result.split(',')[1];
                // MIMEタイプを取得
                const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
                resolve({base64, mimeType});
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 在庫一覧取得
    public async fetchProperties(): Promise<PropertyData[]> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            body: JSON.stringify({
                action: "fetch"
            })
        });
        const responseData = await response.json();
        const properties: PropertyData[] = responseData.data.map((item: any) => ({
            no: item['案件管理No'],
            address: item['所在地'],
            type: item['物件種別'],
            price: item['売値'],
            naiken: item['内見可否'],
        })).filter((item: PropertyData) => item.no && item.no.trim() !== '' && item.no != '案件管理No');
        return properties;
    }

    // 買付フォーム送信
    public async sendKaitsukeFormData(data: KaitsukeFormData): Promise<SendApiResponse> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            body: JSON.stringify({
                action: "kaitsuke",
                data: {
                    "日時": new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
                    "姓": data.lastName,
                    "名": data.firstName,
                    "法人名": data.companyName,
                    "メールアドレス": data.email,
                    "電話番号": data.phone,
                    "住所": data.address,
                    "媒体": data.media,
                    "紹介業者名": data.agentName,
                    "買付金額（万円）": data.offerPrice,
                    "手付金（万円）": data.deposit,
                    "購入方法": data.loan,
                    "他条件": data.conditions.join(', '),
                    "物件番号": data.property.no,
                    "物件住所": data.property.address,
                    "物件種別": data.property.type,
                    "販売金額": data.property.price
                }
            })
        });
        const responseData = await response.json();
        return responseData;
    }

    // 内見フォーム送信
    public async sendNaikenFormData(data: NaikenFormData): Promise<SendApiResponse> {
        // 免許証or名刺のファイルをエンコード（画像またはPDF）
        const fileData = await this.fileToBase64(data.imgFile || new File([], ""));
        // console.log(fileData)
        const response = await fetch(this.baseUrl, {
            method: "POST",
            body: JSON.stringify({
                action: "naiken",
                data: {
                    "日時": new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
                    "氏名": data.name,
                    "メールアドレス": data.email,
                    "希望日①": data.date1,
                    "希望時間帯①": data.time1,
                    "希望日②": data.date2,
                    "希望時間帯②": data.time2,
                    "免許証or名刺": fileData.base64,
                    "免許証or名刺ファイルタイプ": fileData.mimeType,
                    "プライバシーポリシー": data.privacy,
                    "物件番号": data.property.no,
                    "物件住所": data.property.address,
                    "物件種別": data.property.type,
                    "販売金額": data.property.price,
                    "内見可否": data.property.naiken
                }
            })
        });
        const responseData = await response.json();
        return responseData;
    }

    // CAフォーム送信
    public async sendCAFormData(data: CAFormData): Promise<SendApiResponse> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            body: JSON.stringify({
                action: "ca",
                data: {
                    "日時": new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
                    "姓": data.lastName,
                    "名": data.firstName,
                    "法人名": data.companyName,
                    "メールアドレス": data.email,
                    "電話番号": data.phone,
                    "住所": data.address,
                    "物件番号": data.property.no,
                    "物件住所": data.property.address,
                    "物件種別": data.property.type,
                    "販売金額": data.property.price
                }
            })
        });
        const responseData = await response.json();
        return responseData;
    }
}
