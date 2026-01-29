const PDFDocument = require('pdfkit');
const { cleanText, formatUrl } = require('./cleaners');

const sectionOrder = ['summary', 'skills', 'experience', 'projects', 'education', 'internships', 'certifications', 'languages'];

exports.generatePDF = (data, res) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    doc.pipe(res);

    doc.on('error', (err) => {
        console.error('PDF Stream Error:', err);
    });

    try {
        const template = data.template || 'professional';
        let fontRegular = 'Helvetica';
        let fontBold = 'Helvetica-Bold';
        let sectionLineStyle = 'simple';

        if (template === 'academic') {
            fontRegular = 'Times-Roman';
            fontBold = 'Times-Bold';
        } else if (template === 'modern') {
            fontRegular = 'Helvetica';
            fontBold = 'Helvetica-Bold';
            sectionLineStyle = 'thick';
        }

        const addSectionTitle = (title) => {
            doc.moveDown(0.5);
            doc.font(fontBold).fontSize(11).text(title.toUpperCase(), { align: 'left' });

            const lineWidth = doc.page.width - 100;
            const startX = 50;
            const y = doc.y;

            if (sectionLineStyle === 'thick') {
                doc.strokeColor('black').lineWidth(2).moveTo(startX, y).lineTo(startX + lineWidth, y).stroke();
            } else {
                doc.strokeColor('black').lineWidth(0.5).moveTo(startX, y).lineTo(startX + lineWidth, y).stroke();
            }

            doc.moveDown(0.5);
            doc.font(fontRegular).fontSize(10);
        };

        // 1. HEADER
        doc.font(fontBold).fontSize(16).text(data.personalInfo.fullName.toUpperCase(), { align: 'left' });
        doc.moveDown(0.3);

        doc.font(fontRegular).fontSize(10);
        const contactParts = [
            data.personalInfo.phone,
            data.personalInfo.email,
            [data.personalInfo.city, data.personalInfo.state, data.personalInfo.country].filter(Boolean).join(', ')
        ].filter(Boolean);

        if (contactParts.length > 0) {
            doc.text(contactParts.join(' | '), { align: 'left' });
        }

        const linkParts = [];
        if (data.personalInfo.linkedin) linkParts.push({ label: 'LinkedIn', url: formatUrl(data.personalInfo.linkedin) });
        if (data.personalInfo.github) linkParts.push({ label: 'GitHub', url: formatUrl(data.personalInfo.github) });
        if (data.personalInfo.portfolio) linkParts.push({ label: 'Portfolio', url: formatUrl(data.personalInfo.portfolio) });
        if (data.personalInfo.youtube) linkParts.push({ label: 'YouTube', url: formatUrl(data.personalInfo.youtube) });

        if (linkParts.length > 0) {
            doc.moveDown(0.2);
            linkParts.forEach((p, index) => {
                doc.fillColor('blue').text(p.label, {
                    link: p.url,
                    underline: true,
                    continued: true
                });
                doc.fillColor('black').text(index < linkParts.length - 1 ? ' | ' : ' ', { underline: false, link: null, continued: index < linkParts.length - 1 });
            });
            doc.moveDown(0.5);
        } else {
            doc.moveDown(0.5);
        }

        doc.fillColor('black');

        // Render Sections
        sectionOrder.forEach(section => {
            switch (section) {
                case 'summary':
                    if (data.summary) {
                        addSectionTitle('PROFESSIONAL SUMMARY');
                        doc.text(cleanText(data.summary), { align: 'left' });
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
                        data.experience.forEach((exp) => {
                            doc.font(fontBold).text(exp.title, { continued: true });
                            doc.font(fontBold).text(` – ${exp.company}`, { continued: true });
                            doc.font(fontRegular).text(`, ${exp.location}`, { continued: false });

                            doc.font(fontRegular).text(`Duration: ${exp.dates}`, { continued: false });
                            doc.moveDown(0.2);

                            if (exp.description) {
                                (Array.isArray(exp.description) ? exp.description : [exp.description]).forEach(point => {
                                    if (point && point.trim()) {
                                        doc.text(`• ${cleanText(point)}`, { indent: 15, align: 'left' });
                                    }
                                });
                            }
                            doc.moveDown(0.4);
                        });
                        doc.moveDown(0.5);
                    }
                    break;

                case 'projects':
                    if (data.projects && data.projects.length) {
                        addSectionTitle('PROJECTS');
                        data.projects.forEach((proj) => {
                            doc.font(fontBold).text(proj.title, { continued: false });

                            const projLinks = [];
                            if (proj.link) projLinks.push({ label: 'Live Demo', url: formatUrl(proj.link) });
                            if (proj.github) projLinks.push({ label: 'Repo', url: formatUrl(proj.github) });

                            if (projLinks.length > 0) {
                                doc.fontSize(9);
                                projLinks.forEach((l, i) => {
                                    doc.fillColor('blue').text(l.label, { link: l.url, underline: true, continued: true });
                                    doc.fillColor('black').text(i < projLinks.length - 1 ? ' | ' : ' ', { underline: false, link: null, continued: i < projLinks.length - 1 });
                                });
                                doc.fontSize(10).fillColor('black').moveDown(0.2);
                            }

                            if (proj.tools && proj.tools.trim()) {
                                doc.font(fontBold).text('Tools Used: ', { continued: true });
                                doc.font(fontRegular).text(proj.tools.trim(), { continued: false });
                                doc.moveDown(0.2);
                            }

                            if (proj.description) {
                                (Array.isArray(proj.description) ? proj.description : proj.description.split('\n')).forEach(point => {
                                    if (point && point.trim()) {
                                        doc.text(`• ${cleanText(point)}`, { indent: 15, align: 'left' });
                                    }
                                });
                            }
                            if (proj.outcome && proj.outcome.trim()) {
                                doc.text(`Outcome: ${cleanText(proj.outcome)}`, { indent: 15 });
                            }

                            doc.moveDown(0.5);
                        });
                    }
                    break;

                case 'education':
                    if (data.education && data.education.length) {
                        addSectionTitle('EDUCATION');
                        data.education.forEach(edu => {
                            doc.font(fontBold).text(`${edu.qualification} – ${edu.stream}`, { continued: false });
                            doc.font(fontBold).text(edu.institute, { continued: true });
                            doc.font(fontRegular).text(`, ${edu.location}`, { continued: false });
                            doc.font(fontRegular).text(`Completion Year: ${edu.year}${edu.score ? ` | Score: ${edu.score}` : ''}`);
                            doc.moveDown(0.4);
                        });
                        doc.moveDown(0.5);
                    }
                    break;

                case 'certifications':
                    if (data.certifications && data.certifications.length) {
                        addSectionTitle('CERTIFICATIONS');
                        data.certifications.forEach(cert => {
                            doc.font(fontBold).text(cert.name, { continued: true });
                            doc.font(fontBold).text(` – ${cert.organization}`, { continued: true });

                            if (cert.year) {
                                doc.font(fontRegular).text(`, ${cert.year}`, { continued: cert.link ? true : false });
                            }

                            if (cert.link) {
                                doc.fillColor('black').font(fontRegular).text(' | ', { continued: true });
                                doc.fillColor('blue').text('Certificate Link', { link: formatUrl(cert.link), underline: true });
                                doc.fillColor('black').moveDown(0.3);
                            } else {
                                doc.moveDown(0.3);
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
    }

    doc.end();
};

