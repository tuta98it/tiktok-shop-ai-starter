import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase-server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Body = {
  productName?: string;
  targetCustomer?: string;
  tone?: string;
};

type ApiErrorLike = {
  status?: number;
  code?: string;
  message?: string;
};

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 500) : fallback;
}

function isQuotaError(error: unknown) {
  const apiError = error as ApiErrorLike;
  const message = apiError.message?.toLowerCase() ?? "";

  return (
    apiError.status === 429 ||
    apiError.code === "insufficient_quota" ||
    message.includes("quota") ||
    message.includes("billing")
  );
}

function createDemoOutput(productName: string, targetCustomer: string, tone: string) {
  const hashtagBase = productName
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join("");

  return `[DEMO MODE] Nội dung mẫu này được tạo khi OpenAI API hết quota hoặc chưa có billing.

1. 5 hook 3 giây đầu
- Da dầu mà vẫn muốn da nhìn mịn hơn? Xem thử ${productName}.
- Nếu bạn thuộc nhóm ${targetCustomer}, đây là routine đáng thử.
- Một món skincare nhỏ, nhưng có thể giúp routine gọn hơn.
- Đừng mua thêm quá nhiều bước, thử tối ưu từ ${productName} trước.
- Đây là cách giới thiệu ${productName} thật tự nhiên trên TikTok Shop.

2. 3 caption ngắn để đăng TikTok
- ${productName} cho routine skincare đơn giản, dễ theo mỗi ngày.
- Dành cho ${targetCustomer}. Nội dung theo phong cách ${tone}.
- Skincare không cần phức tạp, quan trọng là hợp nhu cầu và dùng đều.

3. 1 script video 30 giây
0-3s: "Nếu bạn đang tìm sản phẩm cho ${targetCustomer}, xem thử món này."
4-10s: Cận cảnh ${productName}, texture, bao bì và cách dùng.
11-20s: Nói rõ lợi ích theo hướng vừa phải, không cam kết quá đà.
21-27s: Gợi ý dùng trong routine hằng ngày và nhắc người xem đọc kỹ thông tin sản phẩm.
28-30s: "Bấm xem sản phẩm trên TikTok Shop nếu bạn muốn tham khảo thêm."

4. 10 hashtag
#${hashtagBase || "sanpham"} #tiktokshop #skincare #lamdep #reviewthat #routine #chamsocda #contentbanhang #xuhuong #muasamthongminh

5. 3 CTA chốt đơn
- Bấm xem chi tiết sản phẩm trước khi thêm vào giỏ.
- Lưu lại nếu bạn đang xây routine skincare tối giản.
- Xem thêm đánh giá và chọn sản phẩm phù hợp với da của bạn.

6. 3 ý tưởng video tiếp theo
- So sánh routine trước và sau khi thêm ${productName}.
- Video cận cảnh texture, mùi hương, cảm giác khi thoa.
- Q&A: ai nên cân nhắc sản phẩm này và ai nên đọc kỹ thành phần trước.`;
}

async function saveGeneration(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  productName: string,
  targetCustomer: string,
  tone: string,
  output: string
) {
  return supabase
    .from("generations")
    .insert({
      user_id: userId,
      product_name: productName,
      target_customer: targetCustomer,
      tone,
      output,
    })
    .select("id, product_name, target_customer, tone, output, created_at")
    .single();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  const productName = cleanText(body.productName);
  const targetCustomer = cleanText(body.targetCustomer);
  const tone = cleanText(body.tone, "gần gũi, rõ ràng, có tính bán hàng");

  if (!productName || !targetCustomer) {
    return NextResponse.json({ error: "Thiếu tên sản phẩm hoặc khách hàng mục tiêu." }, { status: 400 });
  }

  let output = "";
  let usedDemoMode = false;

  if (!process.env.OPENAI_API_KEY) {
    output = createDemoOutput(productName, targetCustomer, tone);
    usedDemoMode = true;
  } else {
    try {
      const prompt = `
Bạn là chuyên gia content TikTok Shop tại Việt Nam.
Hãy tạo nội dung bán hàng tự nhiên, không phóng đại quá mức, không cam kết kết quả y tế/tài chính.

Thông tin sản phẩm:
- Sản phẩm: ${productName}
- Khách hàng mục tiêu: ${targetCustomer}
- Phong cách: ${tone}

Trả về bằng tiếng Việt theo format:
1. 5 hook 3 giây đầu
2. 3 caption ngắn để đăng TikTok
3. 1 script video 30 giây
4. 10 hashtag
5. 3 CTA chốt đơn
6. 3 ý tưởng video tiếp theo
`;

      const response = await openai.responses.create({
        model: "gpt-5-nano",
        input: prompt,
      });

      output = response.output_text || "Không tạo được nội dung.";
    } catch (error) {
      if (!isQuotaError(error)) {
        const message = error instanceof Error ? error.message : "Không gọi được OpenAI API.";
        return NextResponse.json({ error: message }, { status: 500 });
      }

      output = createDemoOutput(productName, targetCustomer, tone);
      usedDemoMode = true;
    }
  }

  const { data: generation, error } = await saveGeneration(
    supabase,
    userData.user.id,
    productName,
    targetCustomer,
    tone,
    output
  );

  if (error) {
    return NextResponse.json({ output, generation: null, warning: error.message, demo: usedDemoMode });
  }

  return NextResponse.json({ output, generation, demo: usedDemoMode });
}
