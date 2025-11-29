"use client";

import { useState, useEffect, useRef } from "react";
import type { PropertyData, NaikenFormData } from "@/types";
import { GasApiService } from "../../api";
import { NaikenConfirmModal } from "@/components/NaikenConfirmModal";
import { NaikenCompleteModal } from "@/components/NaikenCompleteModal";
import { formatNumberWithCommas } from "@/utils";

export default function NaikenForm() {

    const [propertyList, setPropertyList] = useState<PropertyData[]>([]);
    const [naikenInfo, setNaikenInfo] = useState<string | null>(null);  // 選択された物件の内見可否
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
    const [propertyInfo, setPropertyInfo] = useState<PropertyData | null>(null);
    const [formData, setFormData] = useState<NaikenFormData | null>(null);
    const [showNaikenConfirmModal, setShowNaikenConfirmModal] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

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

    const handleSelectProperty = (property: PropertyData) => {
        setPropertyInfo(property);
        setNaikenInfo(property.naiken);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const data = {
            // name: formData.get('name')?.toString() ?? '',
            lastName: formData.get('lastName')?.toString() ?? '',
            firstName: formData.get('firstName')?.toString() ?? '',
            companyName: formData.get('companyName')?.toString() ?? '',
            phone: formData.get('phone')?.toString() ?? '',
            email: formData.get('email')?.toString() ?? '',
            date1: formData.get('date1')?.toString() ?? '',
            time1: formData.get('time1')?.toString() ?? '',
            date2: formData.get('date2')?.toString() ?? '',
            time2: formData.get('time2')?.toString() ?? '',
            privacy: formData.get('privacy')?.toString() === 'on',
            property: propertyInfo!,
            imgFile: formData.get('imgFile') as File | null,
        } as NaikenFormData;

        setFormData(data);
        setShowNaikenConfirmModal(true);
    };

    const handleConfirm = async () => {
        if (formData && formData.property) {
            setIsSubmitting(true);
            try {
                const result = await GasApiService.getInstance().sendNaikenFormData(formData);
                console.log('API Response:', result);
                if (result.status === "success") {
                    setShowNaikenConfirmModal(false);
                    formRef.current?.reset();
                    setPropertyInfo(null);
                    setFormData(null);
                    setShowCompleteModal(true);
                } else {
                    alert("エラーが発生しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + (result.message || "詳細不明"));
                }
            } catch (error) {
                console.error('送信エラー:', error);
                alert("エラーが発生しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + error);
            } finally {
                setIsSubmitting(false);
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
                        <label htmlFor="phone">電話番号<span className="required">*</span></label>
                        <input type="tel" id="phone" name="phone" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">メールアドレス<span className="required">*</span></label>
                        <input type="email" id="email" name="email" required />
                    </div>

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
                                name="propertyNo"
                                onChange={(e) => handleSelectProperty(propertyList.find(p => p.no === e.target.value)!)}
                                defaultValue=""
                                required
                                className="w-full border rounded mt-2 p-2"
                            >
                                <option value="" disabled>-- 物件を選択してください --</option>
                                {filteredProperties.map((property, index) => (
                                    <option key={`property-${index}-${property.no}`} value={property.no}>
                                        {property.no} {property.address} ｜ {property.type} {property.price}万円
                                    </option>
                                ))}
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

                    <div className="text-red-500 mb-4 font-bold">
                        {naikenInfo && (
                            naikenInfo.includes("NG") || naikenInfo.includes("不可") ? <p className="text-lg">※本物件は内見できないため、お申し込みいただけません。</p> :
                                naikenInfo.includes("準備中") ? <p className="text-md">※本物件は内見準備中となります。<br />日程につきましては担当から改めてご連絡させていただきますので、このままお申し込みいただきお待ちください。</p> :
                                    ""
                        )}
                    </div>

                    {!(naikenInfo?.includes("準備中") || naikenInfo?.includes("NG") || naikenInfo?.includes("不可")) && (
                        <>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="form-group flex-1 min-w-0">
                                    <label htmlFor="date1" className="block mb-1">内見希望日①<span className="required">*</span></label>
                                    <input
                                        type="date"
                                        id="date1"
                                        name="date1"
                                        required
                                        className="block w-full p-2 border rounded-md appearance-none"
                                        style={{ WebkitAppearance: 'none' }}
                                    />
                                </div>

                                <div className="form-group flex-1 min-w-0">
                                    <label htmlFor="time1" className="block mb-1">目安時間帯<span className="required">*</span></label>
                                    <select
                                        id="time1"
                                        name="time1"
                                        required
                                        className="block w-full p-2 border rounded-md appearance-none"
                                        defaultValue=""
                                        style={{ WebkitAppearance: 'none' }}
                                    >
                                        <option value="" disabled>選択してください</option>
                                        {Array.from({ length: 48 }, (_, i) => {
                                            const hour = Math.floor(i / 2);
                                            const minute = i % 2 === 0 ? '00' : '30';
                                            return <option key={i} value={`${hour.toString().padStart(2, '0')}:${minute}`}>{`${hour.toString().padStart(2, '0')}:${minute}`}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col md:flex-row gap-4">
                                <div className="form-group flex-1 min-w-0">
                                    <label htmlFor="date2" className="block mb-1">内見希望日②</label>
                                    <input
                                        type="date"
                                        id="date2"
                                        name="date2"
                                        className="block w-full p-2 border rounded-md appearance-none"
                                        style={{ WebkitAppearance: 'none' }}
                                    />
                                </div>

                                <div className="form-group flex-1 min-w-0">
                                    <label htmlFor="time2" className="block mb-1">目安時間帯</label>
                                    <select
                                        id="time2"
                                        name="time2"
                                        className="block w-full p-2 border rounded-md appearance-none"
                                        defaultValue=""
                                        style={{ WebkitAppearance: 'none' }}
                                    >
                                        <option value="" disabled>選択してください</option>
                                        {Array.from({ length: 48 }, (_, i) => {
                                            const hour = Math.floor(i / 2);
                                            const minute = i % 2 === 0 ? '00' : '30';
                                            return <option key={i} value={`${hour.toString().padStart(2, '0')}:${minute}`}>{`${hour.toString().padStart(2, '0')}:${minute}`}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="imgFile">身分証 or 名刺を画像ファイルまたはPDFでアップロードしてください<span className="required">*</span></label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="file"
                                id="imgFile"
                                name="imgFile"
                                required
                                accept="image/*,.pdf"
                                style={{ opacity: 0, position: 'absolute', left: '-9999px' }}
                                onChange={(e) => {
                                    const file = e.target.files && e.target.files[0];
                                    setSelectedFileName(file ? file.name : '');
                                }}
                            />
                            <label htmlFor="imgFile" className="custom-file-upload" style={{ cursor: 'pointer', background: '#3182ce', color: '#fff', padding: '8px 16px', borderRadius: '4px', marginRight: '12px' }}>
                                ファイルをアップロード
                            </label>
                            <span>{selectedFileName || 'ファイルが選択されていません'}</span>
                        </div>
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

                    <button
                        type="submit"
                        id="submitBtn"
                        disabled={isSubmitting || (naikenInfo ? (naikenInfo.includes("NG") || naikenInfo.includes("不可")) : false)}
                    >
                        {naikenInfo && (naikenInfo.includes("NG") || naikenInfo.includes("不可")) ? "内見不可のため申し込めません" : "申し込む"}
                    </button>

                </form>
                <NaikenConfirmModal
                    isOpen={showNaikenConfirmModal}
                    onClose={() => setShowNaikenConfirmModal(false)}
                    onConfirm={handleConfirm}
                    formData={formData}
                    isSubmitting={isSubmitting}
                />
                <NaikenCompleteModal
                    isOpen={showCompleteModal}
                    onClose={() => setShowCompleteModal(false)}
                />
            </div>
        </div>
    )
}