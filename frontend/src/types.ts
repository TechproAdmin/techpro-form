export interface PropertyData {
    no: string;
    address: string;
    type: string;
    price: number;
}

export interface KaitsukeFormData {
    property: PropertyData;
    lastName: string;
    firstName: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    media: string;
    agentName?: string;
    offerPrice: number;
    deposit: number;
    loan: string;
    conditions: string[];
}

export interface NaikenFormData {
    name: string;
    phone: string;
    email: string;
    date1: string;
    time1: string;
    date2: string;
    time2: string;
    imgFile: File;
    privacy: boolean;
    property: PropertyData;
}

export interface SendApiResponse {
    status: string;
    message: string;
}
