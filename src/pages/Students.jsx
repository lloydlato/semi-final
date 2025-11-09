// src/pages/Students.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

function StudentForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    student_number: "",
    year_level: 1,
    course: "",
    ...initial,
  });

  function change(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  return (
    <div className="space-y-4">
      {["first_name", "last_name", "student_number", "course"].map((field, i) => (
        <div key={i}>
          <input
            name={field}
            value={form[field]}
            onChange={change}
            placeholder={field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            className="w-full px-4 py-2.5 bg-white/60 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition backdrop-blur-sm"
          />
        </div>
      ))}

      <select
        name="year_level"
        value={form.year_level}
        onChange={change}
        className="w-full px-4 py-2.5 bg-white/60 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition backdrop-blur-sm"
      >
        <option value={1}>1st Year</option>
        <option value={2}>2nd Year</option>
        <option value={3}>3rd Year</option>
        <option value={4}>4th Year</option>
      </select>

      <div className="flex gap-3 pt-3">
        <button
          onClick={() => onSave(form)}
          className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-semibold"
        >
          💾 Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 hover:scale-[1.02] transition-all duration-300 font-semibold"
        >
          ✖ Cancel
        </button>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, initial: null });

  async function fetchStudents() {
    setLoading(true);
   const { data, error } = await supabase
  .from("students")
  .select("*");

    if (error) console.error(error);
    else setStudents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Add student + create grades row
  async function addStudent(payload) {
    // Validate required fields
    if (!payload.first_name || !payload.last_name || !payload.student_number) {
      return alert("Please fill in all required fields");
    }

    const { data, error } = await supabase
      .from("students")
      .insert([payload])
      .select()
      .single();

    if (error) return alert("Error adding student: " + error.message);

    // Auto-create grade record
    const fullName = `${payload.first_name} ${payload.last_name}`;
    const { error: gradeErr } = await supabase.from("grades").insert([
      {
        student_id: data.id,
        student_name: fullName,
        prelim: 0,
        midterm: 0,
        semifinal: 0,
        final: 0,
      },
    ]);
    if (gradeErr) console.error("Error creating grade record:", gradeErr);

    setModal({ open: false });
    fetchStudents();
  }

  // ✅ Update student
  async function updateStudent(id, payload) {
    const { error } = await supabase.from("students").update(payload).eq("id", id);
    if (error) return alert("Update error: " + error.message);

    // Update student_name in grades table
    const fullName = `${payload.first_name} ${payload.last_name}`;
    await supabase.from("grades").update({ student_name: fullName }).eq("student_id", id);

    setModal({ open: false });
    fetchStudents();
  }

  // ✅ Delete student + grades
  async function removeStudent(id) {
    if (!confirm("Delete this student?")) return;

    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return alert(error.message);

    // Delete related grades
    const { error: gradeError } = await supabase.from("grades").delete().eq("student_id", id);
    if (gradeError) console.error("Error deleting grades:", gradeError);

    fetchStudents();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl mb-10 flex justify-between items-center"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-300 bg-clip-text text-transparent">
            Student Manager
          </h1>
          <button
            onClick={() => setModal({ open: true, initial: null })}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            ➕ Add Student
          </button>
        </motion.div>

        {/* Student List */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex justify-center py-20 text-center">
              <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No students yet</h3>
              <p>Click <span className="font-bold text-sky-400">"Add Student"</span> to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-blue-700/70 to-sky-600/70">
                  <tr>
                    {["Name", "Student #", "Year", "Course", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {students.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/10 transition-all duration-300"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center font-semibold text-white shadow-md">
                          {s.first_name?.[0]}
                          {s.last_name?.[0]}
                        </div>
                        <span className="font-semibold text-sky-200">
                          {s.first_name} {s.last_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{s.student_number}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-sm font-semibold">
                          Year {s.year_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{s.course}</td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button
                          onClick={() => setModal({ open: true, initial: s })}
                          className="px-4 py-2 bg-sky-500/20 hover:bg-sky-600/30 rounded-xl font-semibold text-sky-300 hover:scale-105 transition-all duration-200"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => removeStudent(s.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-600/30 rounded-xl font-semibold text-red-300 hover:scale-105 transition-all duration-200"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white text-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                {modal.initial ? "Edit Student" : "Add New Student"}
              </h3>
              <StudentForm
                initial={modal.initial || {}}
                onSave={(data) => {
                  if (modal.initial?.id) updateStudent(modal.initial.id, data);
                  else addStudent(data);
                }}
                onCancel={() => setModal({ open: false })}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
