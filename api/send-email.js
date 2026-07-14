/**
 * Vercel Serverless Function - 이메일 전송 API 프록시
 * 클라이언트로부터 폼 데이터를 입력받아 서버 환경변수를 사용해 EmailJS REST API로 전달합니다.
 * 이를 통해 API 키가 클라이언트에 노출되는 것을 차단합니다.
 */
export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { from_name, from_email, message } = req.body;

    // 데이터 유효성 검사
    if (!from_name || !from_email || !message) {
      return res.status(400).json({ error: "이름, 이메일 주소, 메시지 내용은 필수 항목입니다." });
    }

    // 서버 환경변수에서 키 정보 로드
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const toEmail = "duku@makeitall.co.kr";

    if (!serviceId || !templateId || !publicKey) {
      console.error("서버 환경변수 구성 에러: EMAILJS 관련 변수가 설정되지 않았습니다.");
      return res.status(500).json({ error: "서버 설정 문제로 이메일을 보낼 수 없습니다. 관리자에게 문의하세요." });
    }

    // EmailJS REST API 호출
    const emailjsResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: from_name,
          from_email: from_email,
          message: message,
          to_email: toEmail,
        },
      }),
    });

    if (emailjsResponse.ok) {
      return res.status(200).json({ success: true, message: "이메일이 성공적으로 전송되었습니다." });
    } else {
      const errorText = await emailjsResponse.text();
      console.error("EmailJS REST API 오류 응답:", errorText);
      return res.status(emailjsResponse.status).json({ error: "EmailJS 전송 오류가 발생했습니다." });
    }
  } catch (error) {
    console.error("서버리스 API 예외 발생:", error);
    return res.status(500).json({ error: "이메일을 발송하는 중 서버 오류가 발생했습니다." });
  }
}
