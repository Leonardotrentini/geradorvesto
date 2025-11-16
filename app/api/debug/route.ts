import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    huggingface: !!process.env.HUGGINGFACE_API_TOKEN,
    replicate: !!process.env.REPLICATE_API_TOKEN,
    huggingfaceLength: process.env.HUGGINGFACE_API_TOKEN?.length || 0,
    replicateLength: process.env.REPLICATE_API_TOKEN?.length || 0,
  })
}

