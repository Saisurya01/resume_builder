const PDFDocument = require('pdfkit');

exports.generatePDF = (data, res) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    doc.pipe(res);

    doc.on('error', (err) => {
        console.error('PDF Stream Error:', err);
    });

    try {
        // Template Logic
        const template = data.template || 'professional';
        let fontRegular = 'Helvetica';
        let fontBold = 'Helvetica-Bold';
        let headerAlign = 'center';
        let sectionLineStyle = 'simple'; // simple, double, thick

        // Section Order Definition
        let sectionOrder = [
            'summary', 'skills', 'experience', 'projects', 'education', 'internships', 'certifications', 'languages'
        ];

        if (template === 'academic') {
            fontRegular = 'Times-Roman';
            fontBold = 'Times-Bold';
            headerAlign = 'center';
            sectionLineStyle = 'double';
            // Academic: Education and Projects emphasized
            sectionOrder = [
                'education', 'projects', 'skills', 'experience', 'summary', 'internships', 'certifications', 'languages'
            ];
        } else if (template === 'modern') {
            fontRegular = 'Helvetica'; // Clean sans-serif
            fontBold = 'Helvetica-Bold';
            headerAlign = 'left';
            sectionLineStyle = 'thick';
            // Modern: Summary and Projects emphasized
            sectionOrder = [
                'summary', 'projects', 'skills', 'experience', 'education', 'internships', 'certifications', 'languages'
            ];
        } else {
            // Professional (Default)
            // Experience before Projects
            sectionOrder = [
                'summary', 'skills', 'experience', 'projects', 'education', 'internships', 'certifications', 'languages'
            ];
        }

        // Helper: Section Title
        const addSectionTitle = (title) => {
            doc.moveDown(0.5);
            doc.font(fontBold).fontSize(11).text(title.toUpperCase(), { align: 'left' });

            // Draw line separator based on style
            const lineWidth = doc.page.width - 100; // margin 50 * 2
            const startX = 50;
            const y = doc.y;

            if (sectionLineStyle === 'thick') {
                doc.strokeColor('black').lineWidth(2).moveTo(startX, y).lineTo(startX + lineWidth, y).stroke();
            } else if (sectionLineStyle === 'double') {
                doc.strokeColor('black').lineWidth(0.5).moveTo(startX, y).lineTo(startX + lineWidth, y).stroke();
                doc.strokeColor('black').lineWidth(0.5).moveTo(startX, y + 2).lineTo(startX + lineWidth, y + 2).stroke();
                doc.moveDown(0.1);
            } else {
                // Simple
                doc.strokeColor('black').lineWidth(0.5).moveTo(startX, y).lineTo(startX + lineWidth, y).stroke();
            }

            doc.moveDown(0.5);
            doc.font(fontRegular).fontSize(10);
        };

        // 1. HEADER (Always first)
        // FULL NAME
        doc.font(fontBold).fontSize(16).text(data.personalInfo.fullName.toUpperCase(), { align: headerAlign });
        doc.moveDown(0.3);

        // Contact Info
        doc.font(fontRegular).fontSize(10);
        const contactParts = [
            data.personalInfo.phone,
            data.personalInfo.email,
            [data.personalInfo.city, data.personalInfo.state, data.personalInfo.country].filter(Boolean).join(', ')
        ].filter(Boolean);

        if (contactParts.length > 0) {
            doc.text(contactParts.join(' | '), { align: headerAlign });
        }

        // Links
        const linkParts = [];
        if (data.personalInfo.linkedin) linkParts.push({ label: 'LinkedIn', url: data.personalInfo.linkedin });
        if (data.personalInfo.github) linkParts.push({ label: 'GitHub', url: data.personalInfo.github });
        if (data.personalInfo.portfolio) linkParts.push({ label: 'Portfolio', url: data.personalInfo.portfolio });

        if (linkParts.length > 0) {
            doc.moveDown(0.2);
            const separator = ' | ';
            let totalWidth = 0;
            doc.font(fontRegular).fontSize(10);
            linkParts.forEach((part, i) => {
                totalWidth += doc.widthOfString(part.label);
                if (i < linkParts.length - 1) totalWidth += doc.widthOfString(separator);
            });

            let startX = 50;
            if (headerAlign === 'center') {
                startX = (doc.page.width - 100 - totalWidth) / 2 + 50;
            }

            let currentY = doc.y;

            linkParts.forEach((part, i) => {
                doc.text(part.label, startX, currentY, { link: part.url, continue: true, underline: false });
                startX += doc.widthOfString(part.label);
                if (i < linkParts.length - 1) {
                    doc.text(separator, startX, currentY, { link: null, continue: true });
                    startX += doc.widthOfString(separator);
                }
            });
            doc.text('', 50, currentY); // Reset line
        }
        doc.moveDown(1);

        // Render Sections based on Order
        sectionOrder.forEach(section => {
            switch (section) {
                case 'summary':
                    if (data.summary) {
                        addSectionTitle('PROFESSIONAL SUMMARY');
                        doc.text(data.summary, { align: 'justify' });
                        doc.moveDown();
                    }
                    break;

                case 'skills':
                    if (data.skills && (data.skills.technical?.length || data.skills.tools?.length || data.skills.softSkills?.length)) {
                        addSectionTitle('SKILLS');
                        const formatSkill = (val) => Array.isArray(val) ? val.join(', ') : val;

                        if (data.skills.technical?.length) {
                            doc.font(fontBold).text('Technical Skills: ', { continued: true });
                            doc.font(fontRegular).text(formatSkill(data.skills.technical));
                        }
                        if (data.skills.tools?.length) {
                            doc.font(fontBold).text('Tools & Technologies: ', { continued: true });
                            doc.font(fontRegular).text(formatSkill(data.skills.tools));
                        }
                        if (data.skills.softSkills?.length) {
                            doc.font(fontBold).text('Soft Skills: ', { continued: true });
                            doc.font(fontRegular).text(formatSkill(data.skills.softSkills));
                        }
                        doc.moveDown();
                    }
                    break;

                case 'experience':
                    if (data.experience && data.experience.length) {
                        addSectionTitle('WORK EXPERIENCE');
                        data.experience.forEach(exp => {
                            doc.font(fontBold).text(`${exp.title} – ${exp.company}, ${exp.location}`);
                            doc.font(fontRegular).text(exp.dates);
                            doc.moveDown(0.2);

                            if (exp.description && exp.description.length) {
                                if (Array.isArray(exp.description)) {
                                    exp.description.forEach(point => {
                                        doc.text(`• ${point}`, { indent: 15, align: 'left' });
                                    });
                                } else {
                                    doc.text(exp.description);
                                }
                            }
                            doc.moveDown(0.5);
                        });
                        doc.moveDown(0.5);
                    }
                    break;

                case 'projects':
                    if (data.projects && data.projects.length) {
                        addSectionTitle('PROJECTS');
                        data.projects.forEach(proj => {
                            doc.font(fontBold).text(proj.title, { continued: true });

                            const links = [];
                            if (proj.link) links.push({ label: 'Live Demo', url: proj.link });
                            if (proj.github) links.push({ label: 'Repo', url: proj.github });

                            if (links.length > 0) {
                                doc.font(fontRegular).text(' | ', { continued: true });
                                links.forEach((l, i) => {
                                    const isLast = i === links.length - 1;
                                    doc.text(l.label, { link: l.url, continued: !isLast, underline: false });
                                    if (!isLast) doc.text(' | ', { continued: true });
                                });
                            } else {
                                doc.text('');
                            }

                            if (proj.tools) {
                                doc.font(fontRegular).text(`Tools Used: ${proj.tools}`);
                            }

                            doc.moveDown(0.2);
                            if (proj.description) doc.text(proj.description);
                            if (proj.outcome) doc.text(`Outcome: ${proj.outcome}`);

                            doc.moveDown(0.5);
                        });
                        doc.moveDown(0.5);
                    }
                    break;

                case 'education':
                    if (data.education && data.education.length) {
                        addSectionTitle('EDUCATION');
                        data.education.forEach(edu => {
                            doc.font(fontBold).text(`${edu.qualification} – ${edu.stream}`);
                            doc.font(fontRegular).text(`${edu.institute}, ${edu.location}`);

                            let yearLine = `Year of Completion: ${edu.year}`;
                            if (edu.score) yearLine += ` | Score: ${edu.score}`;
                            doc.text(yearLine);

                            doc.moveDown(0.5);
                        });
                        doc.moveDown(0.5);
                    }
                    break;

                case 'internships':
                    if (data.internships && data.internships.length) {
                        addSectionTitle('INTERNSHIPS');
                        data.internships.forEach(intern => {
                            doc.font(fontBold).text(`${intern.role} – ${intern.organization}`);
                            doc.font(fontRegular).text(intern.duration);
                            if (intern.description) doc.text(intern.description);
                            doc.moveDown(0.5);
                        });
                        doc.moveDown(0.5);
                    }
                    break;

                case 'certifications':
                    if (data.certifications && data.certifications.length) {
                        addSectionTitle('CERTIFICATIONS');
                        data.certifications.forEach(cert => {
                            doc.font(fontBold).text(`${cert.name} – ${cert.organization}, ${cert.year}`, { continued: !!cert.link });

                            if (cert.link) {
                                doc.font(fontRegular).text(' | ', { continued: true });
                                doc.text('Certificate Link', { link: cert.link, underline: false });
                            } else {
                                doc.text('');
                            }
                        });
                        doc.moveDown(0.5);
                    }
                    break;

                case 'languages':
                    if (data.languages && data.languages.length) {
                        addSectionTitle('LANGUAGES');
                        data.languages.forEach(lang => {
                            doc.font(fontRegular).text(`${lang.language} – ${lang.proficiency}`);
                        });
                    }
                    break;
            }
        });

    } catch (pdfError) {
        console.error('Error building PDF content:', pdfError);
        doc.text('Error generating full resume content.');
    }

    doc.end();
};
