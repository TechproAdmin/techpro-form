export interface PropertyData {
    no: string;
    address: string;
    type: string;
    price: string;
    naiken: string;
}

export interface NaikenFormData {
    name: string;
    phone: string;
    email: string;
    date1: string;
    time1: string;
    date2: string;
    time2: string;
    privacy: boolean;
    property: PropertyData;
} 