"use client";

import { useState, useEffect, useRef } from "react";
import type { PropertyData, NaikenFormData } from "@/types";
import { GasApiService } from "@/api";
import { NaikenConfirmModal } from "@/components/NaikenConfirmModal";
import { formatNumberWithCommas } from "@/utils";

export default function NaikenForm() {

    const [propertyList, setPropertyList] = useState<PropertyData[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
    const [propertyInfo, setPropertyInfo] = useState<PropertyData | null>(null);
    const [formData, setFormData] = useState<NaikenFormData | null>(null);
    const [showNaikenConfirmModal, setShowNaikenConfirmModal] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            const properties = await GasApiService.getInstance().fetchPropertiesNaiken();
            setPropertyList(properties);
            setFilteredProperties(properties);
        };
        fetchProperties();
    }, []);

    useEffect(() => {
        const filtered = propertyList.filter(property => 
            property.no.includes(searchQuery) || 
            property.address.includes(searchQuery)
        );
        setFilteredProperties(filtered);
    }, [searchQuery, propertyList]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name')?.toString() ?? '',
            phone: formData.get('phone')?.toString() ?? '',
            email: formData.get('email')?.toString() ?? '',
            date1: formData.get('date1')?.toString() ?? '',
            time1: formData.get('time1')?.toString() ?? '',
            date2: formData.get('date2')?.toString() ?? '',
            time2: formData.get('time2')?.toString() ?? '',
            privacy: formData.get('privacy')?.toString() === 'on',
            property: propertyInfo!,
        } as NaikenFormData;

        setFormData(data);
        setShowNaikenConfirmModal(true);
    };

    const handleConfirm = async () => {
        if (formData) {
            try {
                const form = formRef.current;
                if (!form) return;

                const submitFormData = new FormData(form);
                submitFormData.set('propertyNo', formData.property.no);
                submitFormData.set('propertyAddress', formData.property.address);
                submitFormData.set('propertyType', formData.property.type);
                submitFormData.set('propertyPrice', formData.property.price.toString());

                const result = await GasApiService.getInstance().sendNaikenFormData(submitFormData);
                console.log('API Response:', result);
                if (result.status === "success") {
                    alert("内見希望を受け付けました。\n日程が確定したら担当よりご連絡いたします。");
                    setShowNaikenConfirmModal(false);
                    formRef.current?.reset();
                    setPropertyInfo(null);
                    setFormData(null);
                } else {
                    alert("エラーが発生しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + (result.message || "詳細不明"));
                }
            } catch (error) {
                console.error('送信エラー:', error);
                alert("エラーが発生しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + error);
            }
        }
    };

    return (
        <div className="naiken-page">
        <div className="form-container">
            <h1>内見希望受付フォーム</h1>
            <p className="text-sm text-red-500 mb-4">
                以下の項目を入力してご希望日をお送りください。<br />
                日程が確定しましたら、担当よりご連絡いたします。
            </p>
            <form ref={formRef} onSubmit={handleSubmit}>

                <div className="form-group">
                    <label htmlFor="propertySearch">内見希望物件名<span className="required">*</span></label>
                    <div className="relative">
                        <input
                        type="text"
                        id="propertySearch"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="物件番号または住所で検索（部分一致可）"
                        className="w-full border rounded p-2"
                        />
                        <select 
                        id="propertySelect" 
                        name="propertyName" 
                        onChange={(e) => setPropertyInfo(propertyList.find(property => property.no + " " + property.address + " " + property.type + " " + property.price === e.target.value) ?? null)}
                        defaultValue=""
                        required
                        className="w-full border rounded mt-2 p-2"
                        >
                            <option value="" disabled>-- 物件を選択してください --</option>
                            {filteredProperties.map((property, index) => {
                                const optionValue = `${property.no} ${property.address} ${property.type} ${property.price}`;
                                return <option key={`property-${index}-${property.no}`} value={optionValue}>
                                    {property.no} {property.address} {property.type} {property.price}
                                </option>
                            })}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="propertyType">物件種別</label>
                    <input 
                        type="text" 
                        id="propertyType" 
                        name="propertyType" 
                        className="no-focus" 
                        value={propertyInfo?.type ?? ''} 
                        readOnly 
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="propertyPrice">販売価格 (万円)</label>
                    <input 
                        type="text" 
                        id="propertyPrice" 
                        name="propertyPrice" 
                        className="no-focus" 
                        value={propertyInfo?.price ? formatNumberWithCommas(propertyInfo.price.toString()) : ''} 
                        readOnly 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="name">氏名<span className="required">*</span></label>
                    <input type="text" id="name" name="name" required />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">電話番号<span className="required">*</span></label>
                    <input type="tel" id="phone" name="phone" required />
                </div>

                <div className="form-group">
                    <label htmlFor="email">メールアドレス<span className="required">*</span></label>
                    <input type="email" id="email" name="email" required />
                </div>

                <div className="flex">
                    <div className="form-group mr-4">
                        <label htmlFor="date1">内見希望日①<span className="required">*</span></label>
                        <input type="date" id="date1" name="date1" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time1">目安時間帯<span className="required">*</span></label>
                        <input type="time" id="time1" name="time1" required />
                    </div>
                </div>

                <div className="flex">
                    <div className="form-group mr-4">
                        <label htmlFor="date2">内見希望日②</label>
                        <input type="date" id="date2" name="date2" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time2">目安時間帯</label>
                        <input type="time" id="time2" name="time2" />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="imgFile">身分証 or 名刺を画像ファイルでアップロードしてください<span className="required">*</span></label>
                    <input type="file" id="imgFile" name="imgFile" required />
                </div>

                <div className="form-group flex mb-4">
                    <input type="checkbox" id="privacy" name="privacy" className="mr-2" required />
                    <label htmlFor="privacy">
                        <a href="https://www.techpro-j.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 border-b border-blue-500">
                            プライバシーポリシー
                        </a>
                        に同意します<span className="required">*</span>
                    </label>
                </div>

                <button type="submit" id="submitBtn">申し込む</button>
                
            </form>
            <NaikenConfirmModal
                isOpen={showNaikenConfirmModal}
                onClose={() => setShowNaikenConfirmModal(false)}
                onConfirm={handleConfirm}
                formData={formData}
            />
        </div>
        </div>
    )
}