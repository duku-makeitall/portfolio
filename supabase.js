import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase가 설정되지 않았거나 Vercel 환경변수가 누락되었을 때 화면 전체가 다운(Crash)되는 것을 방지하기 위한 프록시 더미 클라이언트
const createDummyClient = () => {
  const handler = {
    get(target, prop) {
      if (prop === "then") {
        return (resolve, reject) => reject(new Error("Supabase 설정이 완료되지 않았습니다. Vercel 환경변수 설정을 확인하세요."));
      }
      return new Proxy(() => {}, handler);
    },
    apply(target, thisArg, argumentsList) {
      return new Proxy(() => {}, handler);
    }
  };
  return new Proxy({}, handler);
};

let config = { supabaseUrl: "", supabaseKey: "" };

try {
  const res = await fetch("/api/config");
  if (res.ok) {
    config = await res.json();
  } else {
    console.error("Config API 호출 실패, 상태코드:", res.status);
  }
} catch (e) {
  console.error("Supabase config 동적 로드 에러:", e);
}

let client = null;
if (config.supabaseUrl && config.supabaseKey) {
  try {
    client = createClient(config.supabaseUrl, config.supabaseKey);
  } catch (err) {
    console.error("Supabase 클라이언트 생성 실패:", err);
  }
}

// 초기화 실패 시 더미 클라이언트를 반환해 애플리케이션 충돌을 차단하고 로컬 백업 로드가 동작하게 만듭니다.
export const supabase = client || createDummyClient();
