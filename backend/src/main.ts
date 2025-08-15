import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { format } from "date-fns";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { toZonedTime } from 'date-fns-tz';

// Request型の拡張
declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}

const app = express();
app.use(cors());
app.use(express.json());

// multerの設定
const storage = multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // 日本語ファイル名をURLエンコードして保存
        const encodedFilename = encodeURIComponent(file.originalname);
        cb(null, `${Date.now()}-${encodedFilename}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // 画像ファイルのみ許可
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('画像ファイルのみアップロード可能です'));
        }
    }
});

const PORT = process.env.PORT || 8080;
const ZAIKO_SS_ID = "10uAVMY4vih_AaGHoWIp4q3J0FXDXTppBa7LHD198CgA";
const FORM_SS_ID = "1Q8rwAR7praYZxLO2ATcOQi6V7VDZ1i8AUjVsSPbuQ7Y"

// Google認証の準備
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"
    ],
  });
  return google.sheets({ version: "v4", auth });
}

// メール送信用
class Mail {
    private transporter: nodemailer.Transporter;
    private fromAddress: string;

    constructor() {
        this.fromAddress = 'support@techpro-j.com';
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS
            auth: {
                user: this.fromAddress,
                pass: 'wkmm awtz cwgy bzyh'
            }
        });
    }

    async sendMail(
        toAddress: string, 
        ccAddress: string,
        subject: string, 
        text: string, 
        attachments?: { filename: string; path: string }[]
    ): Promise<void> {
        try {
            const mailOptions = {
                from: this.fromAddress,
                to: toAddress,
                cc: ccAddress,
                subject: subject,
                text: text,
                date: new Date(),
                attachments: attachments || [] 
            };

            await this.transporter.sendMail(mailOptions);
            await this.transporter.close();
        } catch (error) {
            console.error('メール送信エラー:', error);
            throw error;
        }
    }
}

// 在庫一覧を取得
async function fetchProperties() {
    const sheets = await getSheetsClient();

    // 販売案件
    const sheetSale = await sheets.spreadsheets.values.get({
        spreadsheetId: ZAIKO_SS_ID,
        range: "販売案件!A3:L",
    });
    const dataSale = (sheetSale.data.values || []).map((row: any[]) => ({
        no: row[1], address: row[2], type: row[3], price: row[4], naiken: row[11]
    }));

    // 仲介
    const sheetBroker = await sheets.spreadsheets.values.get({
        spreadsheetId: ZAIKO_SS_ID,
        range: "仲介案件!A3:K",
    });
    const dataBroker = (sheetBroker.data.values || []).map((row: any[]) => ({
        no: row[0], address: row[1], type: row[3], price: row[2], naiken: row[10]
    }));

    return [...dataSale, ...dataBroker];
}

// ルートエンドポイント
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Hello from Cloud Run API!" });
});

// 在庫一覧取得エンドポイント
app.get("/fetch", async (req, res) => {
  const properties = await fetchProperties();
  res.json({ status: "success", message: "在庫一覧を取得しました", properties });
});

// 在庫一覧(内見可のみ)取得エンドポイント
app.get("/fetch_naiken", async (req, res) => {
    const properties = await fetchProperties();
    const properties_naiken = properties.filter((property) => property.naiken != "内見NG");
    res.json({ status: "success", message: "在庫一覧(内見可)を取得しました", properties: properties_naiken });
})

// 買付申込フォーム送信エンドポイント
app.post("/send_kaitsuke", (async (req: Request, res: Response) => {
    try {
        const sheets = await getSheetsClient();
        const formData = req.body;

        if (!formData) {
            return res.status(400).json({ status: "error", message: "フォームデータがありません" });
        }

        // conditionsの処理を修正
        let conditionsStr = "";
        if (Array.isArray(formData.conditions)) {
            conditionsStr = formData.conditions.join(", ");
        } else if (typeof formData.conditions === "string") {
            conditionsStr = formData.conditions;
        }

        // 日本時間に変換
        const jstDate = toZonedTime(new Date(), 'Asia/Tokyo');
        const formattedDate = format(jstDate, 'yyyy/MM/dd HH:mm:ss');

        await sheets.spreadsheets.values.append({
            spreadsheetId: FORM_SS_ID,
            range: "買付申込フォーム管理表!A:S",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        "",
                        "",
                        formattedDate,
                        formData.lastName || "",
                        formData.firstName || "",
                        formData.companyName || "",
                        formData.email || "",
                        formData.phone || "",
                        formData.address || "",
                        formData.media || "",
                        formData.agentName || "",
                        formData.offerPrice || "",
                        formData.deposit || "",
                        formData.loan || "",
                        conditionsStr,
                        formData.propertyNo || "",
                        formData.propertyAddress || "",
                        formData.propertyType || "",
                        formData.propertyPrice || ""
                    ]
                ]
            }
        });

        res.json({ status: "success", message: "データを記録しました" });
        // ※メール送信はGASに任せる
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", message: "サーバーエラーが発生しました" });
    }
}) as RequestHandler);

// 内見受付フォーム送信エンドポイント
app.post("/send_naiken", upload.single('imgFile'), (async (req: Request, res: Response) => {
    try {
        const sheets = await getSheetsClient();
        const formData = req.body;
        const file = req.file;

        if (!formData) {
            return res.status(400).json({ status: "error", message: "フォームデータがありません" });
        }

        // 日本時間に変換
        const jstDate = toZonedTime(new Date(), 'Asia/Tokyo');
        const formattedDate = format(jstDate, 'yyyy/MM/dd HH:mm:ss');

        // propertyTypeとpropertyPriceを文字列として処理
        const propertyType = Array.isArray(formData.propertyType) ? formData.propertyType[0] : formData.propertyType;
        const propertyPrice = Array.isArray(formData.propertyPrice) ? formData.propertyPrice[0] : formData.propertyPrice;

        await sheets.spreadsheets.values.append({
            spreadsheetId: FORM_SS_ID,
            range: "内見受付フォーム管理表!A:P",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        "",
                        "",
                        formattedDate,
                        formData.name || "",
                        formData.phone || "",
                        formData.email || "",
                        formData.date1 || "",
                        formData.time1 || "",
                        formData.date2 || "",
                        formData.time2 || "",
                        file ? decodeURIComponent(file.filename) : "",
                        formData.privacy || "",
                        formData.propertyNo || "",
                        formData.propertyAddress || "",
                        propertyType || "",
                        propertyPrice || ""
                    ]
                ]
            }
        });

        // メール送信  ※身分証明書画像を添付するため
        const mail = new Mail();
        const toAddress = formData.email;
        const ccAddress = "support@techpro-j.com";
        const mailTitle = `【${formData.name}様】内見希望を受け付けました（${formData.propertyAddress}）`
        const mailText = `
${formData.name}様

この度は、内見のお申し込みありがとうございます。
以下の内容で申込を受け付けました。
日程が確定しましたら、内見方法をご案内いたしますので、
今しばらくお待ちくださいませ。

【受付内容】
名前: ${formData.name}
電話番号: ${formData.phone}
メールアドレス: ${formData.email}
内見希望日①: ${formData.date1} ${formData.time1}
内見希望日②: ${formData.date2} ${formData.time2}
物件番号: ${formData.propertyNo}
物件住所: ${formData.propertyAddress}
物件種別: ${formData.propertyType}
物件価格: ${formData.propertyPrice}

////////////////////////////////////////////////////////////
東京都知事(1) 免許番号109690
テックプロパティジャパン株式会社
〒150-0043
東京都渋谷区道玄坂1-21-1
SHIBUYA SOLASTA 3F
TEL：03-6843-1838
FAX：03-4243-2722
https://www.techpro-j.com/
////////////////////////////////////////////////////////////
        `;

        await mail.sendMail(
            toAddress,
            ccAddress,
            mailTitle,
            mailText,
            file ? [{
                filename: decodeURIComponent(file.originalname),
                path: file.path
            }] : undefined
        );

        // ファイルの削除（オプション）
        if (file) {
            fs.unlinkSync(file.path);
        }

        res.json({ status: "success", message: "データを記録しました" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", message: "サーバーエラーが発生しました" });
    }
}) as RequestHandler);

// CAフォーム送信エンドポイント
app.post("/send_ca", (async (req: Request, res: Response) => {
    try {
        const sheets = await getSheetsClient();
        const formData = req.body;

        if (!formData) {
            return res.status(400).json({ status: "error", message: "フォームデータがありません" });
        }

        // 日本時間に変換
        const jstDate = toZonedTime(new Date(), 'Asia/Tokyo');
        const formattedDate = format(jstDate, 'yyyy/MM/dd HH:mm:ss');

        // propertyTypeとpropertyPriceを文字列として処理
        const propertyType = Array.isArray(formData.propertyType) ? formData.propertyType[0] : formData.propertyType;
        const propertyPrice = Array.isArray(formData.propertyPrice) ? formData.propertyPrice[0] : formData.propertyPrice;

        await sheets.spreadsheets.values.append({
            spreadsheetId: FORM_SS_ID,
            range: "CAフォーム管理表!A:K",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        "",
                        "",
                        formattedDate,
                        formData.lastName || "",
                        formData.firstName || "",
                        formData.companyName || "",
                        formData.email || "",
                        formData.phone || "",
                        formData.address || "",
                        formData.propertyNo || "",
                        formData.propertyAddress || "",
                    ]
                ]
            }
        });

        // メール送信  ※身分証明書画像を添付するため
        const mail = new Mail();
        const toAddress = formData.email;
        const ccAddress = "support@techpro-j.com";
        const mailTitle = `【${formData.lastName} ${formData.firstName}様】秘密保持誓約書への同意を受け付けました`
        const mailText = `${formData.lastName} ${formData.firstName}様

秘密保持誓約書への同意を受け付けました。

【受付内容】
姓: ${formData.lastName}
名: ${formData.firstName}
法人名: ${formData.companyName}
電話番号: ${formData.phone}
メールアドレス: ${formData.email}
住所: ${formData.address}
物件番号: ${formData.propertyNo}
物件住所: ${formData.propertyAddress}


【秘密保持誓約書条項】
私は、末尾記載の物件（以下「本物件」といいます。）の購入を検討（以下「本件検討」といいます。）するにあたり、貴社から開示を受ける本物件に関する資料・情報について、以下の各条項に従い取り扱うことに同意します。

1. 私は、貴社から開示を受ける一切の資料・情報（本確認書締結前に受領した資料・情報および貴社との打ち合わせ内容その他のやりとりの一切を含むものとします。また、その種類・形態・媒体等を問わないものとし、以下「秘密情報」といいます。）が、秘密情報に該当することを了解したうえ、善良なる管理者の注意義務をもって秘密情報を取扱い、本確認書に別段の定めのある場合を除き、貴社の事前の承諾を得ることなく、秘密情報を第三者に開示しないものとします。

2.私は、秘密情報を本件検討のためにのみ使用し、その他の目的で使用しないものとします。

3.私は、第１項にかかわらず、秘密情報を、本件検討を行うにあたり客観的に知る必要があると判断される当社の役職員、公認会計士、税理士、弁護士（以下「許諾開示者」といいます）に対して貴社の承諾を得ることなく開示することができるものとします。ただし、私は、かかる秘密情報の機密性を許諾開示者に伝え、かつ、私の責任により、許諾開示者をして本確認書の当事者であるのと同等の守秘義務を負担させるものとします。
　
4.私は、法令、通達その他の行政または司法上の手続に従い秘密情報の開示を要求された場合には、適用される法令等の範囲内において、当該要求の内容を直ちに貴社に通知し、かつ、貴社の要請に基づき開示するものとします。適用される法令等に基づき、貴社にあらかじめ通知すること等ができない場合であっても、当該手続きにおいて要求される必要最低限の範囲の秘密情報のみを開示するものとし、当該開示内容についてはその報告が可能となった後、直ちに貴社に報告するものとします。

5.本誓約書において、秘密情報には、（i）貴社による開示の時点において公知である情報、（ⅱ）本確認書の差入後に、秘密保持義務を負うことのない第三者から入手した情報、ならびに（ⅲ）本誓約書差入後に、本誓約書に違反することなく公知となった情報は含まれず、本誓約書の適用はないものとします。

6.私は、秘密情報の完全性・網羅性について、貴社が何らの表明または保証を行うものではないことをあらかじめ了解するものとします。

7.私は、貴社が本物件にかかる取引を完了するまでは、貴社の書面による事前の承諾がない限り、本件検討に関して、本物件の占有者、賃借人その他該当する本物件の利害関係者と、その事由および態様の如何を問わず、接触しないものとします。

8.私は、秘密情報が貴社にとって重要な意義および価値を有するものであることを認識しており、秘密情報の取扱いに関して、私および本誓約書による秘密情報の被開示者（第4項による被開示者を除くものとします。）が、差止請求その他の作為・不作為を命じる裁判所の裁判に服することをあらかじめ承諾するものとします。

9.私は、本誓約書に定める許諾開示者その他秘密情報の開示を受けた者の義務違反の結果、貴社の契約が破綻または解除されるなど、損失を被った場合には損害賠償責任を追うものとするものとします。尚、賠償金額は実損（弁護士費用含む）又は 1,000万円の高い方とします。

10.私は、秘密情報に個人情報の保護に関する法律（以下「個人情報保護法」といいます。）に定義する個人情報が含まれる場合、個人情報保護法および関係ガイドライン等にしたがい、当該情報を取扱うものとします。また、私は、貴社から要請があったときは、当該個人情報の管理に必要と認められる措置を行うものとします。

11.本誓約書に定める合意は、本誓約書の差入日から3年を経過した日に終了するものとします。私は、本件検討が終了したときまたは本件検討を完了させるに当たり合理的に必要であると判断される期間が経過したときは、秘密情報（秘密情報が含まれる資料を含むものとします。本項において同じ。）を、貴社の指示にしたがい、私の責任と費用負担において、貴社に返還するか、破棄するものとします。なお、本項に基づき秘密情報を返還または破棄した後も私は本誓約書に基づく守秘義務を負担するものとします。

12.本誓約書は、日本法を準拠法とし、日本法にしたがって解釈されるものとします。

13.本誓約書に関して貴社との間で紛争が生じたときは、東京地方裁判所を第一審の専属的合意管轄裁判所とするものとします。


ご協力ありがとうございました。

////////////////////////////////////////////////////////////
東京都知事(1) 免許番号109690
テックプロパティジャパン株式会社
〒150-0043
東京都渋谷区道玄坂1-21-1
SHIBUYA SOLASTA 3F
TEL：03-6843-1838
FAX：03-4243-2722
https://www.techpro-j.com/
////////////////////////////////////////////////////////////
        `;

        await mail.sendMail(
            toAddress,
            ccAddress,
            mailTitle,
            mailText,
        );

        res.json({ status: "success", message: "データを記録しました" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", message: "サーバーエラーが発生しました" });
    }
}) as RequestHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
