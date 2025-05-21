import { NextResponse } from "next/server";
import events from "../../../../events-dummy-data.json";

export async function GET() {
  return NextResponse.json(events);
}