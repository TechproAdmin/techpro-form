import type { CAFormData } from "@/types";
import { formatNumberWithCommas } from "@/utils";

interface CAConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: CAFormData | null;
  isSubmitting?: boolean;
}

export const CAConfirmModal = ({ isOpen, onClose, onConfirm, formData, isSubmitting }: CAConfirmModalProps) => {
  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">秘密保持誓約へ同意します</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">お客様情報</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>氏名：</div>
              <div>{formData.lastName} {formData.firstName}</div>
              {formData.companyName && (
                <>
                  <div>法人名：</div>
                  <div>{formData.companyName}</div>
                </>
              )}
              <div>メールアドレス：</div>
              <div>{formData.email}</div>
              <div>電話番号：</div>
              <div>{formData.phone}</div>
              <div>住所：</div>
              <div>{formData.address}</div>
            </div>
          </div>

          {formData.property && (
            <div>
              <h3 className="font-bold">対象物件</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>物件番号：</div>
                <div>{formData.property.no}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>物件住所：</div>
                <div>{formData.property.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>販売価格：</div>
                <div>{formatNumberWithCommas(formData.property.price.toString())}万円</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            修正する
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "送信中..." : "送信する"}
          </button>
        </div>
      </div>
    </div>
  );
}; 