import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import { google } from "googleapis";

const app = express();
app.use(cors());
app.use(express.json());

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

async function test() {
    return [
        {
            "id": 1,
            "name": "test",
            "price": 1000
        }
    ]
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
    const properties_naiken = properties.filter((property) => property.naiken === "【内見可】");
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

        await sheets.spreadsheets.values.append({
            spreadsheetId: FORM_SS_ID,
            range: "買付申込フォーム管理表!A:Q",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        new Date(),
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
                        conditionsStr,  // 処理済みの文字列を使用
                        formData.propertyNo || "",
                        formData.propertyAddress || "",
                        formData.propertyType || "",
                        formData.propertyPrice || ""
                    ]
                ]
            }
        });

        res.json({ status: "success", message: "データを記録しました" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", message: "サーバーエラーが発生しました" });
    }
}) as RequestHandler);

// 内見受付フォーム送信エンドポイント
app.post("/send_naiken", (async (req: Request, res: Response) => {
    try {
        const sheets = await getSheetsClient();
        const formData = req.body;

        if (!formData) {
            return res.status(400).json({ status: "error", message: "フォームデータがありません" });
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId: FORM_SS_ID,
            range: "内見受付フォーム管理表!A:Q",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        new Date(),
                        formData.name || "",
                        formData.phone || "",
                        formData.email || "",
                        formData.date1 || "",
                        formData.time1 || "",
                        formData.date2 || "",
                        formData.time2 || "",
                        formData.imgFile ? JSON.stringify(formData.imgFile) : "",
                        formData.privacy || "",
                        formData.propertyNo || "",
                        formData.propertyAddress || "",
                        formData.propertyType || "",
                        formData.propertyPrice || ""
                    ]
                ]
            }
        });

        res.json({ status: "success", message: "データを記録しました" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", message: "サーバーエラーが発生しました" });
    }
}) as RequestHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
