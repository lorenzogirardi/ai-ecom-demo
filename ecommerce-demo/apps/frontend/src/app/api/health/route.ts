import { NextResponse } from "next/server";
import {
  isXRayEnabled,
  openSegment,
  closeSegment,
  addAnnotation,
} from "@/lib/xray";

export async function GET() {
  const segment = openSegment("frontend-health");

  if (segment) {
    addAnnotation(segment, "http_method", "GET");
    addAnnotation(segment, "http_url", "/api/health");
  }

  const response = {
    status: "ok",
    timestamp: new Date().toISOString(),
    xray: isXRayEnabled() ? "enabled" : "disabled",
  };

  closeSegment(segment, 200);

  return NextResponse.json(response);
}
