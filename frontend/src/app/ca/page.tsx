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
            <p className="text-sm text-red-500">
            以下の内容をご確認いただき、秘密保持の誓約をお願いいたします。
            </p>

            <div className="text-sm border p-4 my-4">
                <p className="mb-4">
                    私は、末尾記載の物件（以下「本物件」といいます。）の購入を検討（以下「本件検討」といいます。）するにあたり、貴社から開示を受ける本物件に関する資料・情報・契約内容等について、以下の各条項に従い取り扱うことに同意します。
                </p>

                <ol className="list-decimal list-inside space-y-4">
                <li>
                    私は、貴社から開示を受ける一切の資料・情報・契約内容等（本誓約条項の同意前に受領した資料・情報および貴社との打ち合わせ内容その他のやりとりの一切を含むものとします。また、その種類・形態・媒体等を問わないものとし、以下「秘密情報」といいます。）が、秘密情報に該当することを了解したうえ、善良なる管理者の注意義務をもって秘密情報を取扱い、本誓約条項に別段の定めのある場合を除き、貴社の事前の承諾を得ることなく、秘密情報を第三者に開示しないものとします。
                </li>

                <li>
                    私は、秘密情報を本件検討のためにのみ使用し、その他の目的で使用しないものとします。
                </li>

                <li>
                    私は、第１項にかかわらず、秘密情報を、本件検討を行うにあたり客観的に知る必要があると判断される当社の役職員、公認会計士、税理士、弁護士及び融資利用の際の金融機関（以下「許諾開示者」といいます。）に限り、貴社の承諾を得ることなく開示することができるものとします。ただし、私は、かかる秘密情報の機密性を許諾開示者に伝え、かつ、私の責任により、許諾開示者に対して本誓約条項の当事者であるのと同等の守秘義務を負わせるものとします。
                </li>

                <li>
                    私は、法令、通達その他の行政または司法上の手続に従い秘密情報の開示を要求された場合には、適用される法令等の範囲内において、当該要求の内容を直ちに貴社に通知し、かつ、貴社の要請に基づき開示するものとします。適用される法令等に基づき、貴社にあらかじめ通知すること等ができない場合であっても、当該手続きにおいて要求される必要最低限の範囲の秘密情報のみを開示するものとし、当該開示内容についてはその報告が可能となった後、直ちに貴社に報告するものとします。
                </li>

                <li>
                    本誓約条項において、秘密情報には、（i）貴社による開示の時点において公知である情報、（ⅱ）本誓約条項の差入後に、秘密保持義務を負うことのない第三者から入手した情報、ならびに（ⅲ）本誓約条項差入後に、本誓約条項に違反することなく公知となった情報は含まれず、本誓約条項の適用はないものとします。
                </li>

                <li>
                    私は、秘密情報の完全性・網羅性について、貴社が何らの表明または保証を行うものではないことをあらかじめ了解するものとします。
                </li>

                <li>
                    私は、貴社が本物件にかかる取引を完了するまでは、貴社の書面または電磁的方法による事前の承諾がない限り、本件検討に関して、本物件の占有者、賃借人その他該当する本物件の利害関係者と、その事由および態様の如何を問わず、接触しないものとします。
                </li>

                <li>
                    私は、秘密情報が貴社にとって重要な意義および価値を有するものであることを認識しており、秘密情報の取扱いに関して、私および本誓約条項による秘密情報の被開示者（第4項による被開示者を除くものとします。）が、差止請求その他の作為・不作為を命じる裁判所の裁判に服することをあらかじめ承諾するものとします。
                </li>

                <li>
                    私は、私や本誓約条項に定める許諾開示者その他秘密情報の開示を受けた者の義務違反の結果、貴社の契約が破綻、契約解除または貴社の名誉が毀損されるなど、損失を被った場合には損害賠償責任を追うものとするものとします。なお、賠償金額は実損（弁護士費用含む）又は1,000万円の高い方とします。
                </li>

                <li>
                    私は、秘密情報に個人情報の保護に関する法律（以下「個人情報保護法」といいます。）に定義する個人情報が含まれる場合、個人情報保護法および関係ガイドライン等にしたがい、当該情報を取扱うものとします。また、私は、貴社から要請があったときは、当該個人情報の管理に必要と認められる措置を行うものとします。
                </li>

                <li>
                    本誓約条項に定める合意は、本誓約条項の差入日から3年を経過した日に終了するものとします。私は、本件検討が終了したときまたは本件検討を完了させるに当たり合理的に必要であると判断される期間が経過したときは、秘密情報（秘密情報が含まれる資料を含むものとします。本項において同じ。）を、貴社の指示に従い、私の責任と費用負担において、貴社に返還するか、破棄するものとします。なお、本項に基づき秘密情報を返還または破棄した後も私は本誓約条項に基づく守秘義務を負うものとします。
                </li>

                <li>
                    本誓約条項は、日本法を準拠法とし、日本法に従って解釈されるものとします。
                </li>

                <li>
                    本誓約条項に関して貴社との間で紛争が生じたときは、東京地方裁判所を第一審の専属的合意管轄裁判所とするものとします。
                </li>
                </ol>
            </div>

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
