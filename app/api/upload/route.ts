import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
}

interface QuizResponse {
  questions: Question[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    let pdfData;
    try {
      pdfData = await pdf(buffer);
    } catch (error) {
      console.error('PDF parsing error:', error);
      return NextResponse.json(
        { error: 'Failed to parse PDF file' },
        { status: 400 }
      );
    }

    const extractedText = pdfData.text.trim();

    if (!extractedText || extractedText.length < 100) {
      return NextResponse.json(
        { error: 'PDF does not contain enough text content' },
        { status: 400 }
      );
    }

    // Truncate text if too long (to avoid token limits)
    const maxTextLength = 8000;
    const textToProcess = extractedText.length > maxTextLength 
      ? extractedText.substring(0, maxTextLength) + '...'
      : extractedText;

    // Create prompt for LLaMA
    const prompt = `You are an expert quiz generator. Based on the following text extracted from a PDF document, generate exactly 5 multiple-choice questions.

Each question should:
- Be clear and educational
- Have exactly 4 options (A, B, C, D)
- Have exactly one correct answer
- Test understanding of the key concepts in the text

Text:
${textToProcess}

You must respond ONLY with valid JSON in this exact format (no additional text or markdown):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0
    }
  ]
}

The "correct_answer" field should be the index (0-3) of the correct option.
Generate exactly 5 questions now:`;

    // Call Groq API with LLaMA 3.3 70B (updated model)
    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
      });
    } catch (error: any) {
      console.error('Groq API error:', error);
      return NextResponse.json(
        { error: `AI generation failed: ${error.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      );
    }

    // Parse the AI response
    let quizData: QuizResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      quizData = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('AI Response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    // Validate the quiz data
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return NextResponse.json(
        { error: 'Invalid quiz format from AI' },
        { status: 500 }
      );
    }

    // Validate each question
    const validatedQuestions = quizData.questions.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      typeof q.correct_answer === 'number' &&
      q.correct_answer >= 0 && 
      q.correct_answer < 4
    );

    if (validatedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: validatedQuestions,
    });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
