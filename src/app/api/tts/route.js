import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'en';

    if (!text || !text.trim()) {
      return new NextResponse('Missing text parameter', { status: 400 });
    }

    // Map regional language codes to TTS engine language target
    let tl = 'en';
    const cleanLang = lang.toLowerCase();

    if (cleanLang.includes('hi') || cleanLang.includes('hindi') || cleanLang.includes('हिंदी')) {
      tl = 'hi';
    } else if (
      cleanLang.includes('bn') ||
      cleanLang.includes('bengali') ||
      cleanLang.includes('বাংলা') ||
      cleanLang.includes('as') ||
      cleanLang.includes('assamese') ||
      cleanLang.includes('অসমীয়া') ||
      cleanLang.includes('mni') ||
      cleanLang.includes('manipuri') ||
      cleanLang.includes('মৈতৈলোন্')
    ) {
      tl = 'bn';
    } else {
      tl = 'en';
    }

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${tl}&client=tw-ob`;

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to synthesize speech', { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Content-Length': String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
