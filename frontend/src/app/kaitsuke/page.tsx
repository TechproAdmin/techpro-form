"use client";

import { useState, useEffect, useRef } from "react";
import type { PropertyData, KaitsukeFormData } from "@/types";
import { formatNumberWithCommas } from "@/utils";
import { GasApiService } from "@/api";
import { KaitsukeConfirmModal } from "@/components/KaitsukeConfirmModal";
import { KaitsukeCompleteModal } from "@/components/KaitsukeCompleteModal";

export default function KaitsukeForm() {
  const [propertyInfo, setPropertyInfo] = useState<PropertyData | null>(null);  // フォームで選択された物件データ
  const [showAgentField, setShowAgentField] = useState(false);  // 紹介元・媒体名の表示/非表示
  const [loanNote, setLoanNote] = useState("");  // 融資特約のメッセージ
  const [propertyList, setPropertyList] = useState<PropertyData[]>([]);  // 物件データのリスト
  const [searchQuery, setSearchQuery] = useState("");  // 検索クエリ
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);  // 検索結果
  const [showKaitsukeConfirmModal, setShowKaitsukeConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [formData, setFormData] = useState<KaitsukeFormData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithCommas(e.target.value);
    e.target.value = formatted;
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mediaValue = e.target.value;
    setShowAgentField(mediaValue === "業者様からの紹介" || mediaValue === "その他");
  };

  const handleLoanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loanValue = e.target.value;
    if (loanValue === "融資利用(融資特約あり)") {
      setLoanNote("※融資承認が得られた方からご契約条件のご案内となります。");
    } else if (loanValue === "融資利用(融資特約なし)") {
      setLoanNote("※融資承認が得られなくても契約解除はできません。");
    } else {
      setLoanNote("");  // 現金購入は文言なし
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      lastName: formData.get('lastName')?.toString() ?? '',
      firstName: formData.get('firstName')?.toString() ?? '',
      companyName: formData.get('companyName')?.toString() ?? '',
      email: formData.get('email')?.toString() ?? '',
      phone: formData.get('phone')?.toString() ?? '',
      address: formData.get('address')?.toString() ?? '',
      media: formData.get('media')?.toString() ?? '',
      agentName: formData.get('agentName')?.toString() ?? '',
      property: propertyInfo!,
      offerPrice: Number(formData.get('offerPrice')?.toString().replace(/,/g, '') ?? 0),
      deposit: Number(formData.get('deposit')?.toString().replace(/,/g, '') ?? 0),
      loan: formData.get('loanContingency')?.toString() ?? '',
      conditions: [
        formData.get('condition1'),
        formData.get('condition2'),
        formData.get('condition3'),
        formData.get('condition4'),
        formData.get('condition5')
      ].filter(Boolean).map(v => v?.toString() ?? '')
    } as KaitsukeFormData;

    setFormData(data);
    setShowKaitsukeConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (formData) {
      try {
        const result = await GasApiService.getInstance().sendKaitsukeFormData(formData);
        console.log('API Response:', result);
        if (result.status === "success") {
          setShowKaitsukeConfirmModal(false);
          formRef.current?.reset();
          setPropertyInfo(null);
          setShowAgentField(false);
          setLoanNote("");
          setSearchQuery("");
          setFormData(null);
          setShowCompleteModal(true);
        } else {
          alert("送信に失敗しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + (result.message || "詳細不明"));
        }
      } catch (error) {
        console.error('送信エラー:', error);
        alert("送信に失敗しました。\nしばらく経ってから再度お試しください。\nこのメッセージが繰り返し出る場合は、お手数ですが弊社に直接お問い合わせください。\n\n" + error);
      }
    }
  };

  return (
    <div className="kaitsuke-page">
    <div className="form-container">
      <h1>買付申込フォーム</h1>
      <p className="text-sm text-red-500">
        物件購入ご希望の場合、フォームに沿ってお申し込みください。<br />
        申込後、担当より申込内容を反映した買付証明書を送付いたします。
      </p>
      <form ref={formRef} onSubmit={handleSubmit}>

        <h2>購入者情報</h2>

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
        
        <div className="form-group">
          <label htmlFor="media">媒体 <span className="required">*</span></label>
          <select 
            id="media" 
            name="media" 
            onChange={handleMediaChange}
            defaultValue=""
            required
          >
            <option value="" disabled>-- この物件を知った媒体をご教示ください --</option>
            <option value="LINE公式アカウント「利回り20%倶楽部」">LINE公式アカウント「利回り20%倶楽部」</option>
            <option value="弊社のメルマガ">弊社のメルマガ</option>
            <option value="健美家">健美家</option>
            <option value="LIFULL HOME'S">LIFULL HOME'S</option>
            <option value="at home">at home</option>
            <option value="不動産投資連合隊">不動産投資連合隊</option>
            <option value="リガイド">リガイド</option>
            <option value="SUUMO">SUUMO</option>
            <option value="Yahoo!不動産">Yahoo!不動産</option>
            <option value="REINS">REINS</option>
            <option value="業者様からの紹介">業者様からの紹介</option>
            <option value="その他">その他</option>

          </select>
        </div>
        
        <div className="form-group" style={{ display: showAgentField ? 'block' : 'none' }}>
          <label htmlFor="agentName">紹介いただいた業者様名 <span className="required">*</span></label>
          <input 
            type="text" 
            id="agentName" 
            name="agentName" 
            placeholder="ご紹介いただいた業者様の名前や媒体名をご入力ください" 
            required={showAgentField}
          />
        </div>
        
        <h2>購入希望条件</h2>
        
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
        
        <div className="form-group">
          <label htmlFor="offerPrice">買付金額 (万円) <span className="required">*</span></label>
          <input 
            type="text" 
            id="offerPrice" 
            name="offerPrice" 
            inputMode="numeric"
            onChange={handleNumberInput}
            pattern="^\d+(?:,\d{3})*$" 
            placeholder="万円単位で半角数字のみでご入力ください"
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="deposit">手付金 (万円) <span className="required">*</span></label>
          <input 
            type="text" 
            id="deposit" 
            name="deposit" 
            inputMode="numeric"
            onChange={handleNumberInput}
            pattern="^\d+(?:,\d{3})*$" 
            placeholder="万円単位で半角数字のみでご入力ください"
            required 
          />
          <div className="note">※購入金額の10%を目安にお願いいたします</div>
        </div>

        <div className="form-group">
          <label htmlFor="loanContingency">購入方法 <span className="required">*</span></label>
          <select 
            id="loanContingency" 
            name="loanContingency" 
            onChange={handleLoanChange}
            defaultValue=""
            required
          >
            <option value="" disabled>-- 選択してください --</option>
            <option value="現金購入">現金購入</option>
            <option value="融資利用(融資特約なし)">融資利用(融資特約なし)</option>
            <option value="融資利用(融資特約あり)">融資利用(融資特約あり)</option>
          </select>
          <div id="loanNote" className="note" style={{display: loanNote ? "block" : "none"}}>{loanNote}</div>
        </div>

        <h2>購入の条件 (任意)</h2>
        <div className="note mb-4">
          <p>ご購入に際し、条件がある場合はご入力ください（最大5つまで）</p>
          <p>※公簿売買・現況有姿・境界非明示でのお引き渡しは基本条件となります（一部物件を除く）</p>
        </div>

        <div className="form-group">
          <label htmlFor="condition1">条件1</label>
          <input type="text" id="condition1" name="condition1" />
        </div>

        <div className="form-group">
          <label htmlFor="condition2">条件2</label>
          <input type="text" id="condition2" name="condition2" />
        </div>

        <div className="form-group">
          <label htmlFor="condition3">条件3</label>
          <input type="text" id="condition3" name="condition3" />
        </div>
        
        <div className="form-group">
          <label htmlFor="condition4">条件4</label>
          <input type="text" id="condition4" name="condition4" />
        </div>

        <div className="form-group">
          <label htmlFor="condition5">条件5</label>
          <input type="text" id="condition5" name="condition5" />
        </div>

        <button type="submit" id="submitBtn">申し込む</button>
      </form>
      <KaitsukeConfirmModal
        isOpen={showKaitsukeConfirmModal}
        onClose={() => setShowKaitsukeConfirmModal(false)}
        onConfirm={handleConfirm}
        formData={formData}
      />
      <KaitsukeCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
      />
    </div>
    </div>
  );
}
