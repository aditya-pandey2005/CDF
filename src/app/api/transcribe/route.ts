import groq from '@/lib/groq';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file');

    if (!audioFile || !(audioFile instanceof File)) {
      return Response.json(
        { error: 'No audio file provided. Please record audio first.', success: false },
        { status: 400 }
      );
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'json',
      language: 'hi', // Optimize for Hindi/Hinglish
    });

    return Response.json({
      text: transcription.text,
      success: true,
    });
  } catch (error) {
    console.error('[Transcribe API] Error:', error);

    const message =
      error instanceof Error ? error.message : 'Transcription failed. Please try again.';

    return Response.json(
      { error: message, success: false },
      { status: 500 }
    );
  }
}
