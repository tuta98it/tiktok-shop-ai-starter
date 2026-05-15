import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase-server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Body = {
  productName?: string;
  targetCustomer?: string;
  tone?: string;
};

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 500) : fallback;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

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
      model: "gpt-5.2",
      input: prompt,
    });

    const output = response.output_text || "Không tạo được nội dung.";

    const { data: generation, error } = await supabase
      .from("generations")
      .insert({
        user_id: userData.user.id,
        product_name: productName,
        target_customer: targetCustomer,
        tone,
        output,
      })
      .select("id, product_name, target_customer, tone, output, created_at")
      .single();

    if (error) {
      return NextResponse.json({ output, generation: null, warning: error.message });
    }

    return NextResponse.json({ output, generation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
