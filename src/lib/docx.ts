import type { CV } from "@/types/cv";
import { Document, Paragraph, Packer, TextRun, ExternalHyperlink, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import cv_json from "@/static/cv.json"
import { format, parseISO } from "date-fns";
const cv: CV = cv_json

const headers = {
    summary: new Paragraph({
        text: "SUMMARY", heading: HeadingLevel.HEADING_1 
    }),
    professional_experience: new Paragraph({
        text: "PROFESSIONAL EXPERIENCE", heading: HeadingLevel.HEADING_1 
    }),
    education: new Paragraph({
        text: "EDUCATION", heading: HeadingLevel.HEADING_1 
    }),
    skills: new Paragraph({
        text: "TECHNICAL SKILLS", heading: HeadingLevel.HEADING_1 
    }),
    languages: new Paragraph({
        text: "LANGUAGES", heading: HeadingLevel.HEADING_1 
    })
}

export default async function generateDocxFromJson() {
    const {name, location, nationality, email, phone, birthdate} = cv.info;
    const links = { email, ...cv.links };
    const info = { name, location, others: `${nationality} | ${birthdate} | ${phone}` };

    const infoParagraphs = Object.entries(info)
        .map(([_, value]) => new Paragraph({
            children: [new TextRun({ text: value })],
        })
    );

    const hyperlinks = Object.entries(links)
        .map(([_, value]) => {
            const text = value.replace(/https?:\/\//, "")
            const link = value.startsWith("http") ? value : `mailto:${value}`;
            return new ExternalHyperlink({
                children: [
                    new TextRun({
                        text: text,
                        style: "Hyperlink",
                    }),
                ],
                link: link,
            })
        }
    )

    const linksParagraph = new Paragraph({
        children: hyperlinks.reduce((acc, link, index) => {
            if (index > 0 && index < hyperlinks.length) {
                acc.push(new TextRun({ text: " | " }));
            }
            acc.push(link);
            return acc;
        }, [] as (TextRun | ExternalHyperlink)[]),
    });

    const summaryParagraph = new Paragraph({
        children: [new TextRun({ text: cv.summary })],
    });

    const professionalExperienceParagraphs = cv.professional_experience.flatMap(exp => {
        const title = new Paragraph({
            text: `${exp.company} - ${exp.type}`,
            heading: HeadingLevel.HEADING_2,
        });
        const descriptions = exp.positions.flatMap(pos => {
            const startDate = format(parseISO(pos.start_date), "MMM yyyy")
            const endDateString = pos.end_date
            const endDate =
                endDateString.toLowerCase() === "present"
                    ? "present"
                    : format(parseISO(endDateString), "MMM yyyy")
            const posTitle = new Paragraph({
                text: `${pos.role}, ${startDate} - ${endDate}`,
                heading: HeadingLevel.HEADING_3,
            });
            const posDesc = pos.tasks.map(task => {
                if (typeof task === "string") {
                    return new Paragraph({
                        text: task,
                        bullet: {
                            level: 0,
                        },
                    })
                } 

                const link = new ExternalHyperlink({
                    children: [
                        new TextRun({
                            text: task.publication.title,
                            style: "Hyperlink",
                        }),
                    ],
                    link: task.publication.link,
                })
                return new Paragraph({
                    children:[
                        new TextRun({ text: task.item + " - " }),
                        link,
                        new TextRun({ text: ` (${task.publication.year})` }),
                    ],
                    bullet: {
                        level: 0,
                    },
                })
            });
            return [posTitle, ...posDesc];
        })
        return [title, ...descriptions];
    })

    const educationParagraphs = cv.education.flatMap(edu => {
        const startDate = format(parseISO(edu.start_date), "yyyy")
        const endDate = format(parseISO(edu.end_date), "yyyy")
        const eduTitle = new Paragraph({
            text: edu.degree,
            heading: HeadingLevel.HEADING_2,
        });
        const eduDesc = new Paragraph({
            text: `${edu.institution}, ${startDate} - ${endDate}`,
        });
        return [eduTitle, eduDesc];
    })

    const skillsParagraph = cv.technical_skills.map(skill => new Paragraph({
        text: skill,
        bullet: {
            level: 0,
        }
    }))

    const languagesParagraph = cv.languages.map(lang => new Paragraph({
        text: `${lang.language} - ${lang.proficiency}`,
        bullet: {
            level: 0,
        }
    }))

    const doc = new Document({
        sections: [
            {
                children: [
                    ...infoParagraphs,
                    linksParagraph,
                    headers.summary,
                    summaryParagraph,
                    headers.professional_experience,
                    ...professionalExperienceParagraphs,
                    headers.education,
                    ...educationParagraphs,
                    headers.skills,
                    ...skillsParagraph,
                    headers.languages,
                    ...languagesParagraph
                ],
            },
        ],
        styles: {
            default: {
                heading1: {
                    run: {
                        font: "Helvetica",
                        size: 28,
                        bold: true,
                        color: "444444",
                    },
                    paragraph: {
                        spacing: {
                            after: 120,
                            before: 240,
                        },
                    },
                },
                heading2: {
                    run: {
                        font: "Helvetica",
                        size: 22,
                        bold: true,
                        color: "555555",
                    },
                    paragraph: {
                        spacing: {
                            after: 60,
                            before: 120,
                        },
                    },
                },
                heading3: {
                    run: {
                        font: "Helvetica",
                        size: 20,
                        bold: true,
                        color: "666666",
                    },
                    paragraph: {
                        spacing: {
                            after: 80,
                            before: 80,
                        },
                    },
                },
                document: {
                    run: {
                        font: "Helvetica",
                    },
                    paragraph: {
                        spacing: {
                            after: 40,
                            before: 40,
                        },
                    },
                }
            }
        }
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "LeonardoSole-CV.docx");
}
