// src/pages/Grades.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Grades() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [subjects] = useState([
    "Mathematics",
    "Science",
    "English",
    "Programming",
    "Database Systems",
  ]);
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");

  useEffect(() => {
    fetchData();
  }, [selectedSubject]);

  // ✅ Fetch students and grades for selected subject
  const fetchData = async () => {
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("*");

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      return;
    }

    const { data: gradesData, error: gradesError } = await supabase
      .from("grades")
      .select("*")
      .eq("subject", selectedSubject);

    if (gradesError) {
      console.error("Error fetching grades:", gradesError);
      return;
    }

    // ✅ Auto-create missing grade records for this subject
    for (const s of studentsData) {
      const fullName = `${s.first_name} ${s.last_name}`;
      const existing = gradesData.find(
        (g) => g.student_name === fullName && g.subject === selectedSubject
      );

      if (!existing) {
        const newGrade = {
          student_id: s.id,
          student_name: fullName,
          subject: selectedSubject,
          prelim: 0,
          midterm: 0,
          semifinal: 0,
          final: 0,
          average: 0,
          remark: "Not Graded",
        };

        const { error: insertError } = await supabase
          .from("grades")
          .insert([newGrade]);

        if (insertError)
          console.error("❌ Insert error for", fullName, insertError);
        else console.log(`✅ Created blank grade for ${fullName}`);
      }
    }

    const { data: updatedGrades } = await supabase
      .from("grades")
      .select("*")
      .eq("subject", selectedSubject);

    const combined = studentsData.map((s) => {
      const grade = updatedGrades.find(
        (g) => g.student_name === `${s.first_name} ${s.last_name}`
      );
      return {
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        prelim: grade?.prelim || 0,
        midterm: grade?.midterm || 0,
        semifinal: grade?.semifinal || 0,
        final: grade?.final || 0,
        remark: grade?.remark || "Not Graded",
      };
    });

    setStudents(studentsData);
    setGrades(combined);
  };

  const handleChange = (index, field, value) => {
    const updated = [...grades];
    updated[index][field] = value;

    const hasFailure = ["prelim", "midterm", "semifinal", "final"].some(
      (key) => parseFloat(updated[index][key]) >= 4.0
    );

    updated[index].remark = hasFailure ? "⚠️ Failed" : "✅ Passed";
    setGrades(updated);
  };

  const calculateAverage = (student) => {
    const { prelim, midterm, semifinal, final } = student;
    const scores = [prelim, midterm, semifinal, final].map(
      (n) => parseFloat(n) || 0
    );
    const sum = scores.reduce((a, b) => a + b, 0);
    return (sum / 4).toFixed(2);
  };

  const printGrades = () => window.print();

  // ✅ Save grades by subject
  const saveGrades = async () => {
    setSaving(true);

    try {
      for (const g of grades) {
        const { data: existing } = await supabase
          .from("grades")
          .select("id")
          .eq("student_name", g.name)
          .eq("subject", selectedSubject)
          .maybeSingle();

        const hasFailure =
          parseFloat(g.prelim) >= 4.0 ||
          parseFloat(g.midterm) >= 4.0 ||
          parseFloat(g.semifinal) >= 4.0 ||
          parseFloat(g.final) >= 4.0;

        const gradeRecord = {
          student_name: g.name,
          student_id: g.id,
          subject: selectedSubject,
          prelim: parseFloat(g.prelim) || 0,
          midterm: parseFloat(g.midterm) || 0,
          semifinal: parseFloat(g.semifinal) || 0,
          final: parseFloat(g.final) || 0,
          average: parseFloat(calculateAverage(g)) || 0,
          remark: hasFailure ? "Failed" : "Passed",
        };

        if (existing) {
          await supabase.from("grades").update(gradeRecord).eq("id", existing.id);
        } else {
          await supabase.from("grades").insert([gradeRecord]);
        }
      }

      alert("✅ Grades saved successfully!");
      await fetchData();
    } catch (error) {
      console.error("Error saving grades:", error);
      alert("❌ Failed to save grades.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ AI Summary
  const generateAIAnalysis = () => {
    const total = grades.length;
    const failed = grades.filter(
      (s) =>
        parseFloat(s.prelim) >= 4.0 ||
        parseFloat(s.midterm) >= 4.0 ||
        parseFloat(s.semifinal) >= 4.0 ||
        parseFloat(s.final) >= 4.0
    );
    const passed = total - failed.length;

    const avgOverall =
      grades.reduce((sum, s) => sum + parseFloat(calculateAverage(s)), 0) /
      (grades.length || 1);

    return {
      total,
      passed,
      failed: failed.length,
      avgOverall: avgOverall.toFixed(2),
      failedStudents: failed.map((s) => s.name),
    };
  };

  const report = generateAIAnalysis();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-800 flex items-center justify-center p-6">
      <style>
        {`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 text-white">
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          🎓 Student Grades Management
        </h1>

        {/* ✅ Subject Selector + Buttons */}
        <div className="flex flex-wrap justify-between items-center mb-6 no-print gap-4">
          <div>
            <label className="font-semibold text-lg text-sky-300 mr-3">
              Select Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white/20 border border-white/30 text-white rounded-lg px-3 py-2"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveGrades}
              disabled={saving}
              className={`${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 hover:shadow-emerald-500/30"
              } text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg transition-all duration-300`}
            >
              💾 {saving ? "Saving..." : "Save Grades"}
            </button>

            <button
              onClick={printGrades}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:scale-105 hover:shadow-blue-500/30 transition-all duration-300"
            >
              🖨️ Print
            </button>

            <button
              onClick={() => setShowReport(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            >
              🤖 AI Analysis
            </button>
          </div>
        </div>

        {/* ✅ Grades Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-md">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wide">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-center">Prelim</th>
                <th className="p-3 text-center">Midterm</th>
                <th className="p-3 text-center">Semifinal</th>
                <th className="p-3 text-center">Final</th>
                <th className="p-3 text-center">Average</th>
                <th className="p-3 text-center">Remark</th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {grades.map((student, index) => (
                <tr
                  key={student.id}
                  className="hover:bg-white/10 transition-all duration-300"
                >
                  <td className="p-3 font-semibold text-sky-300">
                    {student.name}
                  </td>
                  {["prelim", "midterm", "semifinal", "final"].map((field) => (
                    <td key={field} className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-20 bg-white/20 text-white border border-white/30 rounded-lg p-1.5 text-center focus:ring-2 focus:ring-sky-400 outline-none"
                        value={student[field]}
                        onChange={(e) =>
                          handleChange(index, field, e.target.value)
                        }
                      />
                    </td>
                  ))}
                  <td className="p-2 text-center font-bold text-green-300">
                    {calculateAverage(student)}
                  </td>
                  <td
                    className={`p-2 text-center font-semibold ${
                      student.remark?.includes("Fail")
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {student.remark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ AI Analysis Modal */}
        {showReport && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-white to-sky-50 rounded-2xl p-8 max-w-lg w-full text-gray-800 relative shadow-2xl">
              <h2 className="text-3xl font-extrabold mb-4 text-sky-700">
                🤖 AI Analysis Report ({selectedSubject})
              </h2>
              <p>Total Students: <strong>{report.total}</strong></p>
              <p>Passed: <strong className="text-green-600">{report.passed}</strong></p>
              <p>Failed: <strong className="text-red-600">{report.failed}</strong></p>
              <p>Overall Average: <strong className="text-blue-600">{report.avgOverall}</strong></p>

              {report.failedStudents.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-red-700 mb-2">
                    ⚠️ Students with Failing Grades:
                  </h3>
                  <ul className="list-disc list-inside">
                    {report.failedStudents.map((name) => (
                      <li key={name} className="text-red-600">{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setShowReport(false)}
                className="mt-6 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-sky-500"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
