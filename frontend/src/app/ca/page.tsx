"use client";

import { useState, useEffect, useRef } from "react";
import type { PropertyData, CAFormData } from "@/types";
import { formatNumberWithCommas } from "@/utils";
import { CACompleteModal } from "@/components/CACompleteModal";
import { CAConfirmModal } from "@/components/CAConfirmModal";
import { GasApiService } from "@/api";

export default function CAForm() {
    const [propertyInfo, setPropertyInfo] = useState<PropertyData | null>(null);  // フォームで選択された物件データ
    const [propertyList, setPropertyList] = useState<PropertyData[]>([]);  // 物件データのリスト
    const [searchQuery, setSearchQuery] = useState("");  // 検索クエリ
    const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);  // 検索結果
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showCAConfirmModal, setShowCAConfirmModal] = useState(false);
    const [formData, setFormData] = useState<CAFormData | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const fetchProperties = async () => {
          const properties = await GasApiService.getInstance().fetchProperties();
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

        const data: CAFormData = {
            property: propertyInfo!,
            lastName: formData.get("lastName") as string,
            firstName: formData.get("firstName") as string,
            companyName: formData.get("companyName") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string
        } as CAFormData;

        setFormData(data);
        setShowCAConfirmModal(true);
    };

    const handleConfirm = async () => {
        if (formData) {
        setIsSubmitting(true);
            try {
            const response = await GasApiService.getInstance().sendCAFormData(formData);
            if (response.status === "success") {
                setShowCAConfirmModal(false);
                setShowCompleteModal(true);
                } else {
                    alert("送信に失敗しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + (response.message || "詳細不明"));
                }
            } catch (error) {
                console.error('送信エラー:', error);
                alert("送信に失敗しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + error);
            }
        }
    };
    
    const handleComplete = async () => {
        setShowCompleteModal(false);
        formRef.current?.reset();
        setPropertyInfo(null);
        setFormData(null);
    };

    return (
        <div className="ca-page">
        <div className="form-container">

            <h1>秘密保持誓約</h1>
            <p className="text-sm text-red-500 mb-4 font-bold text-l">
                <a href="/ca-articles" className="text-blue-500 border-b border-blue-500">
                    こちらのページ
                </a>
                をご確認いただき、秘密保持の誓約をお願いいたします。
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group flex mb-4">
                    <input type="checkbox" id="privacy" name="privacy" className="mr-2" required />
                    <label htmlFor="privacy">
                        秘密保持条項に同意します<span className="required">*</span>
                    </label>
                </div>

                <h2>対象となるお取引</h2>
                <div className="form-group">
                    <label htmlFor="propertySearch">購入希望物件 <span className="required">*</span></label>
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
                        onChange={(e) => setPropertyInfo(propertyList.find(property => property.no + " " + property.address + " ｜ " + property.type + " " + property.price === e.target.value) ?? null)}
                        defaultValue=""
                        required
                        className="w-full border rounded mt-2 p-2"
                        >
                        <option value="" disabled>-- 物件を選択してください --</option>
                        {filteredProperties.map((property, index) => {
                            const optionValue = `${property.no} ${property.address} ｜ ${property.type} ${property.price}`;
                            return <option key={`property-${index}-${property.no}`} value={optionValue}>
                            {property.no} {property.address} ｜ {property.type} {property.price}
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

                <h2>お客様情報</h2>
                <div className="form-group">
                    <label htmlFor="lastName">姓 <span className="required">*</span></label>
                    <input type="text" id="lastName" name="lastName" required />
                </div>

                    <div className="form-group">
                    <label htmlFor="firstName">名 <span className="required">*</span></label>
                    <input type="text" id="firstName" name="firstName" required />
                </div>

                <div className="form-group">
                    <label htmlFor="companyName">法人名</label>
                    <input type="text" id="companyName" name="companyName" />
                    <div className="note">※法人名義で購入される場合はご入力ください</div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">メールアドレス <span className="required">*</span></label>
                    <input type="email" id="email" name="email" required />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">電話番号 <span className="required">*</span></label>
                    <input type="tel" id="phone" name="phone" pattern="[\d\-]+" required />
                </div>

                <div className="form-group">
                    <label htmlFor="address">住所 <span className="required">*</span></label>
                    <input type="text" id="address" name="address" required />
                </div>

                <button type="submit" id="submitBtn" className="mt-4">提出する</button>
            </form>
                        
            <CAConfirmModal
                isOpen={showCAConfirmModal}
                onClose={() => setShowCAConfirmModal(false)}
                onConfirm={handleConfirm}
                formData={formData}
                isSubmitting={isSubmitting}
            />
            <CACompleteModal
                isOpen={showCompleteModal}
                onClose={handleComplete}
                onConfirm={handleComplete}
                formData={formData}
            />
        </div>
    </div>
    );
  }
