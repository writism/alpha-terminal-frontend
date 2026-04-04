"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function KakaoCreateAccountPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const continueUrl = searchParams.get("continue");
    if (continueUrl) {
      window.location.href = continueUrl;
    }
  }, [searchParams]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>카카오 로그인으로 이동 중...</p>
    </div>
  );
}
