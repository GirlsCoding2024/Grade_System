document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentForm');
    const subjectsContainer = document.getElementById('subjectsContainer');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const maxSubjects = 12;
    let subjectCount = 0;
    let allStudents = [];

    addSubjectBtn.addEventListener('click', () => {
        if (subjectCount < maxSubjects) {
            subjectCount++;
            const subjectDiv = document.createElement('div');
            subjectDiv.classList.add('form-group');
            subjectDiv.innerHTML = `
                <div>
                    <label for="subjectName${subjectCount}">Subject Name</label>
                    <input type="text" id="subjectName${subjectCount}" class="subjectName" required>
                </div>
                <div>
                    <label for="ca1Score${subjectCount}">CA1 Score (Max 20)</label>
                    <input type="text" id="ca1Score${subjectCount}" class="ca1Score" required>
                </div>
                <div>
                    <label for="ca2Score${subjectCount}">CA2 Score (Max 20)</label>
                    <input type="text" id="ca2Score${subjectCount}" class="ca2Score" required>
                </div>
                <div>
                    <label for="examScore${subjectCount}">Exam Score (Max 60)</label>
                    <input type="text" id="examScore${subjectCount}" class="examScore" required>
                </div>
            `;
            subjectsContainer.appendChild(subjectDiv);
        } else {
            alert('Maximum of 12 subjects can be added.');
        }
    });

    studentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const term = document.getElementById('term').value;
        const studentName = document.getElementById('studentName').value;
        const className = document.getElementById('className').value;
        const numberInClass = document.getElementById('numberInClass').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const teacherComments = document.getElementById('teacherComments').value;
        const principalComments = document.getElementById('principalComments').value;

        const subjects = [];
        let totalSubjects = 0;
        let grandTotal = 0;

        for (let i = 1; i <= subjectCount; i++) {
            const subjectName = document.getElementById(`subjectName${i}`).value;
            const ca1Score = document.getElementById(`ca1Score${i}`).value;
            const ca2Score = document.getElementById(`ca2Score${i}`).value;
            const examScore = document.getElementById(`examScore${i}`).value;

            const isAbsent = value => value === '-' || value === '';
            const ca1 = isAbsent(ca1Score) ? 0 : parseFloat(ca1Score);
            const ca2 = isAbsent(ca2Score) ? 0 : parseFloat(ca2Score);
            const exam = isAbsent(examScore) ? 0 : parseFloat(examScore);

            // Validate scores
            if (ca1Score !== '-' && (ca1 > 20 || ca1 < 0)) {
                alert('Please enter CA1 Score between 0 and 20.');
                return;
            }
            if (ca2Score !== '-' && (ca2 > 20 || ca2 < 0)) {
                alert('Please enter CA2 Score between 0 and 20.');
                return;
            }
            if (examScore !== '-' && (exam > 60 || exam < 0)) {
                alert('Please enter Exam Score between 0 and 60.');
                return;
            }

            const totalScore = ca1 + ca2 + exam;

            if (totalScore > 0 || (ca1Score === '-' && ca2Score === '-' && examScore === '-')) { // Only count subjects with scores or marked absent
                totalSubjects++;
                grandTotal += totalScore;
                const grade = calculateGrade(totalScore);
                const description = getDescription(grade);

                subjects.push({
                    name: subjectName,
                    ca1: ca1Score,
                    ca2: ca2Score,
                    exam: examScore,
                    total: totalScore,
                    grade: grade,
                    description: description
                });
            }
        }

        const averageScore = totalSubjects > 0 ? (grandTotal / totalSubjects).toFixed(2) : '0.00';
        const averagePercentage = totalSubjects > 0 ? ((grandTotal / (totalSubjects * 80)) * 100).toFixed(2) : '0.00'; // Max CA + Exam = 80

        const student = {
            term: term,
            name: studentName,
            class: className,
            numberInClass: numberInClass,
            gender: gender,
            subjects: subjects,
            teacherComments: teacherComments,
            principalComments: principalComments,
            grandTotal: grandTotal,
            averageScore: averageScore,
            averagePercentage: averagePercentage
        };

        allStudents.push(student);
        displayResults();
        studentForm.reset();
        subjectCount = 0;
        subjectsContainer.innerHTML = '<h3>Subjects</h3>';
    });

    function displayResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '<h2>Student Results</h2>';

        const highestScores = getHighestScores();

        allStudents.forEach((student, index) => {
            const studentInfo = document.createElement('div');
            studentInfo.className = 'student-info';
            studentInfo.innerHTML = `
                <center><h3>REPORT SHEET - ${student.term.toUpperCase()}</h3></center>
                <h2><strong>Name:</strong> ${student.name}</h2>
                <p><strong>Class:</strong> ${student.class}</p>
                <p><strong>Number in Class:</strong> ${student.numberInClass}</p>
                <p><strong>Gender:</strong> ${student.gender}</p>
                <button class="print-btn" data-student-index="${index}">Print</button>
            `;

            const resultsTable = document.createElement('table');
            resultsTable.className = 'results-table';
            resultsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>CA1 Score</th>
                        <th>CA2 Score</th>
                        <th>Exam Score</th>
                        <th>Total Score</th>
                        <th>Grade</th>
                        <th>Description</th>
                        <th>Highest Score</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;

            const resultsTableBody = resultsTable.querySelector('tbody');
            student.subjects.forEach(subject => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${subject.name}</td>
                    <td>${subject.ca1}</td>
                    <td>${subject.ca2}</td>
                    <td>${subject.exam}</td>
                    <td>${subject.total}</td>
                    <td>${subject.grade}</td>
                    <td>${subject.description}</td>
                    <td>${highestScores[subject.name] || 'N/A'}</td>
                `;
                resultsTableBody.appendChild(row);
            });

            const totalsRow = document.createElement('tr');
            totalsRow.innerHTML = `
                <td colspan="4"><strong>Grand Total Score</strong></td>
                <td>${student.grandTotal}</td>
                <td colspan="3"><strong>Average Score</strong> ${student.averageScore}%</td>
            `;
            resultsTableBody.appendChild(totalsRow);

            studentInfo.appendChild(resultsTable);

            const commentsSection = document.createElement('div');
            commentsSection.className = 'comments-section';
            commentsSection.innerHTML = `
                <h4>Teacher Comments</h4>
                <p>${student.teacherComments}</p>
                <h4>Principal Comments</h4>
                <p>${student.principalComments}</p>
            `;
            studentInfo.appendChild(commentsSection);

            const gradingSystem = document.createElement('div');
            gradingSystem.className = 'grading-system';
            gradingSystem.innerHTML = `
                <center><h4>Grading System</h4></center>
                <table style="border: 2px solid green;">
                    <thead>
                        <tr>
                            <th>Grade</th>
                            <th>Score Range</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>A1</td><td>75.0 - 100.0</td></tr>
                        <tr><td>B2</td><td>70.0 - 74.9</td></tr>
                        <tr><td>B3</td><td>65.0 - 69.9</td></tr>
                        <tr><td>C4</td><td>60.0 - 64.9</td></tr>
                        <tr><td>C5</td><td>55.0 - 59.9</td></tr>
                        <tr><td>C6</td><td>50.0 - 54.9</td></tr>
                        <tr><td>D7</td><td>45.0 - 49.9</td></tr>
                        <tr><td>E8</td><td>40.0 - 44.9</td></tr>
                        <tr><td>F9</td><td>0.0 - 39.9</td></tr>
                    </tbody>
                </table>
            `;
            studentInfo.appendChild(gradingSystem);

            resultsContainer.appendChild(studentInfo);
        });

        const printButtons = document.querySelectorAll('.print-btn');
        printButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const studentIndex = e.target.dataset.studentIndex;
                generatePDF(allStudents[studentIndex]);
            });
        });
    }

    function calculateGrade(totalScore) {
        if (totalScore >= 75) return 'A1';
        if (totalScore >= 70) return 'B2';
        if (totalScore >= 65) return 'B3';
        if (totalScore >= 60) return 'C4';
        if (totalScore >= 55) return 'C5';
        if (totalScore >= 50) return 'C6';
        if (totalScore >= 45) return 'D7';
        if (totalScore >= 40) return 'E8';
        return 'F9';
    }

    function getDescription(grade) {
        switch (grade) {
            case 'A1': return 'Excellent';
            case 'B2': return 'Very Good';
            case 'B3': return 'Good';
            case 'C4': return 'Credit';
            case 'C5': return 'Credit';
            case 'C6': return 'Credit';
            case 'D7': return 'Pass';
            case 'E8': return 'Pass';
            case 'F9': return 'Fail';
            default: return 'N/A';
        }
    }

    function getHighestScores() {
        const highestScores = {};

        allStudents.forEach(student => {
            student.subjects.forEach(subject => {
                if (!highestScores[subject.name] || subject.total > highestScores[subject.name]) {
                    highestScores[subject.name] = subject.total;
                }
            });
        });

        return highestScores;
    }

    function generatePDF(student) {
        // PDF generation logic here (can use libraries like jsPDF)
        // For example purposes, we will just console.log the student data
        console.log('Generating PDF for', student.name);
    }
});
