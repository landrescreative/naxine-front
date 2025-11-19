import { NextResponse } from "next/server";
import { getPlatformDiagnostics } from "@/lib/admin-diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diagnostics = await getPlatformDiagnostics();
    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error("[api][admin][diagnostics]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los diagnósticos" },
      { status: 500 }
    );
  }
}

