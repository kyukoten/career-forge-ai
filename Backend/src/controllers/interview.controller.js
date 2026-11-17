const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, evaluateCandidateAnswer } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        let resumeText = ""
        if (req.file && req.file.buffer) {
            try {
                const parsed = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
                resumeText = parsed.text || ""
            } catch (pdfErr) {
                console.warn("Failed to parse PDF:", pdfErr.message)
            }
        }
        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required."
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Error generating interview report:", err)
        res.status(500).json({
            message: err.message || "Failed to generate interview report. Please check API connection."
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Error getting interview report:", err)
        res.status(500).json({
            message: err.message || "Failed to fetch interview report."
        })
    }
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (err) {
        console.error("Error getting all interview reports:", err)
        res.status(500).json({
            message: err.message || "Failed to fetch interview reports."
        })
    }
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (err) {
        console.error("Error generating resume PDF:", err)
        res.status(500).json({
            message: err.message || "Failed to generate resume PDF."
        })
    }
}

/**
 * @description Controller to evaluate a candidate's practiced answer using STAR criteria.
 */
async function evaluateAnswerController(req, res) {
    try {
        const { question, userAnswer, questionType, jobDescription } = req.body

        if (!question || !userAnswer) {
            return res.status(400).json({
                message: "Both question and your answer are required for evaluation."
            })
        }

        const evaluation = await evaluateCandidateAnswer({
            question,
            userAnswer,
            questionType,
            jobDescription
        })

        res.status(200).json({
            message: "Answer evaluated successfully.",
            evaluation
        })
    } catch (err) {
        console.error("Evaluation error:", err)
        res.status(500).json({
            message: err.message || "Failed to evaluate answer. Please try again."
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    evaluateAnswerController
}