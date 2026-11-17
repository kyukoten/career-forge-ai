const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
})

const DEFAULT_MODELS = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3-flash-preview"
].filter(Boolean)

async function generateStructuredContent({ prompt, schema }) {
    let lastError = null
    for (const model of DEFAULT_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: zodToJsonSchema(schema),
                }
            })
            if (response && response.text) {
                return JSON.parse(response.text)
            }
        } catch (err) {
            lastError = err
            console.warn(`[AI Service] Model ${model} failed, trying next model:`, err.message || err)
        }
    }
    throw new Error(lastError ? `AI Generation Error: ${lastError.message}` : "Unable to generate content with available models")
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    atsAnalysis: z.object({
        breakdown: z.object({
            keywordMatch: z.number().min(0).max(100).describe("Score for ATS keyword density and alignment (0-100)"),
            technicalSkills: z.number().min(0).max(100).describe("Score for hard technical skills match (0-100)"),
            softSkills: z.number().min(0).max(100).describe("Score for soft skills, communication and collaboration match (0-100)"),
            experienceLevel: z.number().min(0).max(100).describe("Score for seniority and experience alignment (0-100)")
        }).describe("Detailed percentage breakdown of the ATS evaluation"),
        matchedKeywords: z.array(z.string()).describe("List of critical keywords from the job description found on the candidate's profile"),
        missingKeywords: z.array(z.string()).describe("List of high-priority keywords from the job description that are missing on the profile"),
        recommendations: z.array(z.string()).describe("Actionable tips to improve the resume's ATS pass rate and keyword optimization")
    }).describe("In-depth ATS resume optimization and keyword comparison matrix"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

const answerEvaluationSchema = z.object({
    score: z.number().min(0).max(100).describe("Overall score from 0 to 100 on answer quality, clarity, and relevance"),
    feedback: z.string().describe("Constructive 2-3 sentence overview of the answer's strengths and weaknesses"),
    starChecklist: z.object({
        situation: z.boolean().describe("Did the candidate clearly set the situation or background context?"),
        task: z.boolean().describe("Did the candidate explain the exact task, problem, or objective?"),
        action: z.boolean().describe("Did the candidate describe specific personal actions, tools, and decisions?"),
        result: z.boolean().describe("Did the candidate share the measurable impact, outcome, or lesson learned?")
    }).describe("STAR framework compliance check"),
    strengths: z.array(z.string()).describe("2-3 specific things the candidate did very well"),
    improvements: z.array(z.string()).describe("2-3 specific suggestions to make this answer significantly stronger"),
    improvedAnswer: z.string().describe("An exemplary, polished model answer following STAR and industry best practices")
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a comprehensive interview preparation report and deep ATS resume analysis for a candidate with the following details:
Resume Content: ${resume || "Not provided directly"}
Self Description: ${selfDescription || "Not provided"}
Target Job Description: ${jobDescription}

Perform a rigorous multi-factor evaluation:
1. Overall match score (0-100) and granular ATS percentage breakdown across:
   - keywordMatch: How closely candidate keywords match the job requirements.
   - technicalSkills: Alignment with required tech stack, languages, tools, frameworks.
   - softSkills: Communication, problem solving, teamwork, leadership.
   - experienceLevel: Alignment with required seniority, years, and scope.
2. Extract high-impact "matchedKeywords" present in candidate profile, and "missingKeywords" that are critical in the job description but absent from the profile.
3. Provide 2-3 actionable "recommendations" to optimize ATS passing rate.
4. Generate relevant technical and behavioral interview questions with interviewer intent and model answers.
5. Identify skill gaps with severity levels (low, medium, high).
6. Create an actionable day-by-day preparation roadmap.`

    return await generateStructuredContent({ prompt, schema: interviewReportSchema })
}

async function evaluateCandidateAnswer({ question, userAnswer, questionType = "technical", jobDescription = "" }) {
    const prompt = `You are an elite Tech Interview Coach evaluating a candidate's practice response.
Target Job Context: ${jobDescription || "Software Engineer / Professional Tech Role"}
Question Type: ${questionType}
Interview Question: "${question}"

Candidate's Practiced Answer:
"""
${userAnswer}
"""

Evaluate this response objectively:
1. Score from 0 to 100 based on depth, accuracy, clarity, and impact.
2. Evaluate adherence to the STAR framework (Situation, Task, Action, Result).
3. Identify top strengths and critical missed points/weaknesses.
4. Provide a refined, world-class version of the answer that the candidate can study and learn from.`

    return await generateStructuredContent({ prompt, schema: answerEvaluationSchema })
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const jsonContent = await generateStructuredContent({ prompt, schema: resumePdfSchema })
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf, evaluateCandidateAnswer }