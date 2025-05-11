// 数値文字列を3桁区切りにフォーマットするヘルパー関数
export function formatNumberWithCommas(numStr: string) {
    // 数字以外を除去
    const plainNum = numStr.replace(/[^0-9]/g, "");
    if (plainNum === "") return "";
    // 3桁ごとにカンマ挿入:contentReference[oaicite:6]{index=6}
    return plainNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }