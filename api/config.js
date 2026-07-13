/**
 * Vercel Serverless Function - 공통 Config 제공 API
 * 서버 환경변수에서 Supabase URL과 Public Anon Key를 읽어와 클라이언트에 제공합니다.
 * 소스 코드상에 API 키 정보가 노출 및 하드코딩되는 것을 원천 차단합니다.
 */
export default async function handler(req, res) {
  // GET 요청만 허용
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("서버 환경변수 누락: SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다.");
      return res.status(500).json({ error: "환경변수가 설정되지 않았습니다." });
    }

    // 클라이언트 초기화에 필요한 정보만 내려줌
    return res.status(200).json({
      supabaseUrl: supabaseUrl,
      supabaseKey: supabaseKey,
    });
  } catch (error) {
    console.error("Config API 에러:", error);
    return res.status(500).json({ error: "설정 로드 중 서버 오류가 발생했습니다." });
  }
}
