const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const { cleanText, formatUrl } = require('./cleaners');

exports.generateDocx = async (data, res) => {
    try {
        const doc = new Document({
            styles: {
                default: {
                    heading1: {
                        run: {
                            size: 32,
                            bold: true,
                            color: "000000",
                        },
                    },
                    heading2: {
                        run: {
                            size: 24,
                            bold: true,
                            color: "000000",
                        },
                    },
                },
                paragraphStyles: [
                    {
                        id: "Hyperlink",
                        name: "Hyperlink",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            color: "0000FF",
                            underline: {
                                type: "single",
                                color: "0000FF",
                            },
                        },
                    },
                ],
            },
            sections: [
                {
                    properties: {},
                    children: [
                        // 1. HEADER
                        new Paragraph({
                            children: [new TextRun({ text: data.personalInfo.fullName.toUpperCase(), bold: true, size: 32 })],
                            alignment: AlignmentType.LEFT,
                        }),
                        new Paragraph({
                            text: [
                                data.personalInfo.phone,
                                data.personalInfo.email,
                                [data.personalInfo.city, data.personalInfo.state, data.personalInfo.country].filter(Boolean).join(', ')
                            ].filter(Boolean).join(' | '),
                            alignment: AlignmentType.LEFT,
                        }),
                        createLinkParagraph([
                            { label: 'LinkedIn', url: data.personalInfo.linkedin },
                            { label: 'GitHub', url: data.personalInfo.github },
                            { label: 'Portfolio', url: data.personalInfo.portfolio },
                            { label: 'YouTube', url: data.personalInfo.youtube }
                        ]),
                        new Paragraph({ text: "" }),

                        ...generateSections(data)
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.docx');
        res.send(buffer);

    } catch (error) {
        console.error('DOCX Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Error generating DOCX');
        }
    }
};

function createLinkParagraph(links) {
    const children = [];
    const validLinks = links.filter(l => l.url);

    validLinks.forEach((l, i) => {
        children.push(
            new ExternalHyperlink({
                children: [
                    new TextRun({
                        text: l.label,
                        style: "Hyperlink",
                    }),
                ],
                link: formatUrl(l.url),
            })
        );
        if (i < validLinks.length - 1) {
            children.push(new TextRun(" | "));
        }
    });

    return new Paragraph({
        children: children,
        alignment: AlignmentType.LEFT,
    });
}

function createSectionTitle(title) {
    return new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22 })],
        heading: HeadingLevel.HEADING_2,
        border: {
            bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 },
        },
    });
}

function generateSections(data) {
    const children = [];
    const sectionOrder = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages'];

    sectionOrder.forEach(section => {
        switch (section) {
            case 'summary':
                if (data.summary) {
                    children.push(createSectionTitle("PROFESSIONAL SUMMARY"));
                    children.push(new Paragraph({ text: cleanText(data.summary) }));
                    children.push(new Paragraph({ text: "" }));
                }
                break;

            case 'skills':
                if (data.skills && (data.skills.technical?.length || data.skills.tools?.length || data.skills.softSkills?.length)) {
                    children.push(createSectionTitle("SKILLS"));
                    const formatSkill = (val) => Array.isArray(val) ? val.join(', ') : (val || '');

                    if (data.skills.technical?.length) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({ text: "Technical Skills: ", bold: true }),
                                new TextRun(formatSkill(data.skills.technical)),
                            ],
                        }));
                    }
                    if (data.skills.tools?.length) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({ text: "Tools & Technologies: ", bold: true }),
                                new TextRun(formatSkill(data.skills.tools)),
                            ],
                        }));
                    }
                    if (data.skills.softSkills?.length) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({ text: "Soft Skills: ", bold: true }),
                                new TextRun(formatSkill(data.skills.softSkills)),
                            ],
                        }));
                    }
                    children.push(new Paragraph({ text: "" }));
                }
                break;

            case 'experience':
                if (data.experience && data.experience.length) {
                    children.push(createSectionTitle("WORK EXPERIENCE"));
                    data.experience.forEach(exp => {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({ text: exp.title, bold: true }),
                                new TextRun({ text: ` – ${exp.company}`, bold: true }),
                                new TextRun({ text: `, ${exp.location}` }),
                            ],
                        }));
                        children.push(new Paragraph({ text: `Duration: ${exp.dates}` }));
                        if (exp.description) {
                            (Array.isArray(exp.description) ? exp.description : [exp.description]).forEach(point => {
                                if (point && point.trim()) {
                                    children.push(new Paragraph({
                                        text: cleanText(point),
                                        bullet: { level: 0 }
                                    }));
                                }
                            });
                        }
                        children.push(new Paragraph({ text: "" }));
                    });
                }
                break;

            case 'projects':
                if (data.projects && data.projects.length) {
                    children.push(createSectionTitle("PROJECTS"));
                    data.projects.forEach(proj => {
                        children.push(new Paragraph({
                            children: [new TextRun({ text: proj.title, bold: true })],
                        }));

                        const pLinks = [];
                        if (proj.link) pLinks.push({ label: 'Live Demo', url: proj.link });
                        if (proj.github) pLinks.push({ label: 'Repo', url: proj.github });

                        if (pLinks.length > 0) {
                            children.push(createLinkParagraph(pLinks));
                        }

                        if (proj.tools) {
                            children.push(new Paragraph({
                                children: [
                                    new TextRun({ text: "Tools Used: ", bold: true }),
                                    new TextRun(proj.tools),
                                ],
                            }));
                        }

                        if (proj.description) {
                            (Array.isArray(proj.description) ? proj.description : proj.description.split('\n')).forEach(point => {
                                if (point && point.trim()) {
                                    children.push(new Paragraph({
                                        text: cleanText(point),
                                        bullet: { level: 0 }
                                    }));
                                }
                            });
                        }
                        if (proj.outcome) {
                            children.push(new Paragraph({ text: `Outcome: ${cleanText(proj.outcome)}`, indent: { left: 720 } }));
                        }
                        children.push(new Paragraph({ text: "" }));
                    });
                }
                break;

            case 'education':
                if (data.education && data.education.length) {
                    children.push(createSectionTitle("EDUCATION"));
                    data.education.forEach(edu => {
                        children.push(new Paragraph({
                            children: [new TextRun({ text: `${edu.qualification} – ${edu.stream}`, bold: true })],
                        }));
                        children.push(new Paragraph({
                            children: [
                                new TextRun({ text: edu.institute, bold: true }),
                                new TextRun({ text: `, ${edu.location}` }),
                            ],
                        }));
                        children.push(new Paragraph({ text: `Completion Year: ${edu.year}${edu.score ? ` | Score: ${edu.score}` : ''}` }));
                        children.push(new Paragraph({ text: "" }));
                    });
                }
                break;

            case 'certifications':
                if (data.certifications && data.certifications.length) {
                    children.push(createSectionTitle("CERTIFICATIONS"));
                    data.certifications.forEach(cert => {
                        const certParts = [
                            new TextRun({ text: cert.name, bold: true }),
                            new TextRun({ text: ` – ${cert.organization}`, bold: true }),
                        ];
                        if (cert.year) certParts.push(new TextRun({ text: `, ${cert.year}` }));

                        if (cert.link) {
                            certParts.push(new TextRun({ text: " | " }));
                            children.push(new Paragraph({
                                children: [
                                    ...certParts,
                                    new ExternalHyperlink({
                                        children: [new TextRun({ text: "Certificate Link", style: "Hyperlink" })],
                                        link: formatUrl(cert.link)
                                    })
                                ]
                            }));
                        } else {
                            children.push(new Paragraph({ children: certParts }));
                        }
                    });
                    children.push(new Paragraph({ text: "" }));
                }
                break;

            case 'languages':
                if (data.languages && data.languages.length) {
                    children.push(createSectionTitle("LANGUAGES"));
                    data.languages.forEach(lang => {
                        children.push(new Paragraph({
                            text: `${lang.language} – ${lang.proficiency}`
                        }));
                    });
                }
                break;
        }
    });

    return children;
}

