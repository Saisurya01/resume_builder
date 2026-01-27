const PDFDocument = require('pdfkit');

exports.generatePDF = (data, res) => {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    doc.pipe(res);

    doc.on('error', (err) => {
        console.error('PDF Stream Error:', err);
    });

    doc.on('finish', () => {
        console.log('PDF generation finished');
    });

    try {
        // Configure Styles based on Template
        const template = data.template || 'classic';
        let bodyFont = 'Helvetica';
        let headerFont = 'Helvetica-Bold';
        let alignHeader = 'left';
        let alignName = 'center';

        if (template === 'professional') {
            bodyFont = 'Times-Roman';
            headerFont = 'Times-Bold';
            alignHeader = 'left';
            alignName = 'center'; // Keep name centered for professional look often
        } else if (template === 'executive') {
            bodyFont = 'Helvetica';
            headerFont = 'Helvetica-Bold';
            alignHeader = 'center';
            alignName = 'center';
        }

        doc.font(bodyFont);

        // 1. Personal Information
        doc.fontSize(18).text(data.personalInfo.fullName.toUpperCase(), { align: alignName });
        doc.moveDown(0.3);

        const contactParts = [
            data.personalInfo.phone,
            data.personalInfo.email,
            [data.personalInfo.city, data.personalInfo.state, data.personalInfo.country].filter(Boolean).join(', ')
        ].filter(Boolean);

        doc.fontSize(10).text(contactParts.join(' | '), { align: 'center' });

        const linkParts = [
            data.personalInfo.linkedin,
            data.personalInfo.portfolio
        ].filter(Boolean);

        if (linkParts.length > 0) {
            doc.moveDown(0.2);
            doc.text(linkParts.join(' | '), { align: 'center', link: null });
        }
        doc.moveDown(1);

        // Helper: Section Title
        const addSection = (title) => {
            doc.font(headerFont).fontSize(11).text(title.toUpperCase(), { align: alignHeader });

            // Draw line: different styles for different templates
            if (template === 'executive') {
                // Centered line for executive
                const lineWidth = 200;
                const startX = (doc.page.width - lineWidth) / 2;
                doc.strokeColor('black').lineWidth(0.5).moveTo(startX, doc.y).lineTo(startX + lineWidth, doc.y).stroke();
            } else {
                // Standard left line
                doc.strokeColor('black').lineWidth(0.5).moveTo(doc.x, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
            }

            doc.moveDown(0.5);
            doc.font(bodyFont).fontSize(10);
        };

        // 2. Professional Summary
        if (data.summary) {
            addSection('PROFESSIONAL SUMMARY');
            doc.text(data.summary, { align: 'justify' });
            doc.moveDown();
        }

        // 3. Skills
        if (data.skills && (data.skills.technical?.length || data.skills.tools?.length || data.skills.softSkills?.length)) {
            addSection('SKILLS');
            if (data.skills.technical?.length) doc.text(`Technical: ${data.skills.technical.join(', ')}`);
            if (data.skills.tools?.length) doc.text(`Tools & Technologies: ${data.skills.tools.join(', ')}`);
            if (data.skills.softSkills?.length) doc.text(`Soft Skills: ${data.skills.softSkills.join(', ')}`);
            doc.moveDown();
        }

        // 4. Work Experience
        if (data.experience && data.experience.length) {
            addSection('WORK EXPERIENCE');
            data.experience.forEach(exp => {
                doc.font(headerFont).text(`${exp.title} – ${exp.company}, ${exp.location}`);
                doc.font(bodyFont).text(exp.dates);
                doc.moveDown(0.3);
                if (exp.description && exp.description.length) {
                    if (Array.isArray(exp.description)) {
                        exp.description.forEach(point => {
                            doc.text(`• ${point}`, { indent: 15, align: 'left' });
                        });
                    } else {
                        doc.text(exp.description);
                    }
                }
                doc.moveDown(0.8);
            });
        }

        // 5. Education
        if (data.education && data.education.length) {
            addSection('EDUCATION');
            data.education.forEach(edu => {
                doc.font(headerFont).text(`${edu.qualification} – ${edu.stream}`);
                doc.font(bodyFont).text(`${edu.institute}, ${edu.location}`);
                doc.font(bodyFont).text(`Year of Completion: ${edu.year}`);
                doc.moveDown(0.5);
            });
            doc.moveDown();
        }

        // 6. Projects
        if (data.projects && data.projects.length) {
            addSection('PROJECTS');
            data.projects.forEach(proj => {
                doc.font(headerFont).text(proj.title);

                // Sub-line for links
                const links = [];
                if (proj.github) links.push(`GitHub: ${proj.github}`);
                if (proj.link) links.push(`Live: ${proj.link}`);

                if (links.length > 0) {
                    doc.font(bodyFont).fontSize(9).text(links.join(' | '));
                    doc.fontSize(10); // reset
                }

                if (proj.tools) doc.font(bodyFont).text(`Tools Used: ${proj.tools}`);
                doc.moveDown(0.2);
                if (proj.description) doc.text(proj.description);
                if (proj.outcome) doc.text(`Outcome: ${proj.outcome}`);
                doc.moveDown(0.5);
            });
        }

        // 7. Certifications
        if (data.certifications && data.certifications.length) {
            addSection('CERTIFICATIONS');
            data.certifications.forEach(cert => {
                let certLine = `${cert.name} – ${cert.organization}, ${cert.year}`;
                if (cert.link) {
                    certLine += ` | ${cert.link}`;
                }
                doc.text(certLine);
            });
            doc.moveDown();
        }

        // 8. Internships
        if (data.internships && data.internships.length) {
            addSection('INTERNSHIPS');
            data.internships.forEach(intern => {
                doc.font(headerFont).text(`${intern.role} – ${intern.organization}`);
                doc.font(bodyFont).text(intern.duration);
                if (intern.description) doc.text(intern.description);
                doc.moveDown(0.5);
            });
        }

        // 9. Languages
        if (data.languages && data.languages.length) {
            addSection('LANGUAGES');
            data.languages.forEach(lang => {
                doc.text(`${lang.language} – ${lang.proficiency}`);
            });
        }
    } catch (pdfError) {
        console.error('Error building PDF content:', pdfError);
        doc.text('Error generating full resume content.');
    }

    doc.end();
};
