/**
 * Vercel Serverless Function - 이메일 전송 API 프록시
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    const { from_name, from_email, message } = req.body ?? {};

    if (!from_name?.trim() || !from_email?.trim() || !message?.trim()) {
      return res.status(400).json({
        error: "이름, 이메일 주소, 메시지 내용은 필수 항목입니다.",
      });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS 환경변수 누락:", {
        EMAILJS_SERVICE_ID: Boolean(serviceId),
        EMAILJS_TEMPLATE_ID: Boolean(templateId),
        EMAILJS_PUBLIC_KEY: Boolean(publicKey),
        EMAILJS_PRIVATE_KEY: Boolean(privateKey),
      });

      return res.status(500).json({
        error: "서버 설정 문제로 이메일을 보낼 수 없습니다.",
      });
    }

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        from_name: from_name.trim(),
        from_email: from_email.trim(),
        message: message.trim(),
        to_email: "duku@makeitall.co.kr",
      },
    };

    // EmailJS 계정에서 Private Key 사용이 설정된 경우에만 추가
    if (privateKey) {
      payload.accessToken = privateKey;
    }

    const emailjsResponse = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const responseText = await emailjsResponse.text();

    if (!emailjsResponse.ok) {
      console.error("EmailJS REST API 오류:", {
        status: emailjsResponse.status,
        statusText: emailjsResponse.statusText,
        body: responseText,
      });

      return res.status(emailjsResponse.status).json({
        error: "EmailJS 전송 오류가 발생했습니다.",
        detail: responseText,
        status: emailjsResponse.status,
      });
    }

    return res.status(200).json({
      success: true,
      message: "이메일이 성공적으로 전송되었습니다.",
    });
  } catch (error) {
    console.error("서버리스 API 예외 발생:", error);

    return res.status(500).json({
      error: "이메일을 발송하는 중 서버 오류가 발생했습니다.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}