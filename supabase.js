import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 런타임에 Vercel 서버리스 API(/api/config)를 호출해 Supabase 설정 정보를 동적으로 받아옵니다.
// Top-level await를 사용하여 기존 import 사용처의 변경 없이 동기적 로드를 제공합니다.
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

export const supabase = createClient(config.supabaseUrl, config.supabaseKey);
