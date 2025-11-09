// src/pages/Subjects.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [modal, setModal] = useState({ open: false, initial: null });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch subjects from Supabase
  async function fetchSubjects() {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      alert("❌ Failed to fetch subjects. Please check your Supabase table.");
    } else {
      setSubjects(data);
    }
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ Save or update subject
  async function saveSubject(payload, id) {
    if (!payload.subject_code || !payload.subject_name || !payload.instructor) {
      alert("⚠️ Please fill in all fields before saving.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (id) {
        res = await supabase.from("subjects").update(payload).eq("id", id);
      } else {
        res = await supabase.from("subjects").insert([payload]);
      }

      if (res.error) {
        console.error("Save error:", res.error.message);
        alert("❌ Failed to save subject: " + res.error.message);
      } else {
        alert("✅ Subject saved successfully!");
        setModal({ open: false });
        fetchSubjects();
      }
    } finally {
      setLoading(false);
    }
  }

  // ✅ Delete subject
  async function deleteSubject(id) {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error.message);
      alert("❌ Failed to delete subject: " + error.message);
    } else {
      alert("🗑 Subject deleted successfully!");
      fetchSubjects();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating glow effects */}
      <div className="absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl top-20 left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      <div className="max-w-5xl w-full bg-gray-900/60 backdrop-blur-2xl border border-gray-700 rounded-3xl shadow-2xl p-8 text-center relative z-10 transition-transform duration-500 hover:scale-[1.02] hover:shadow-blue-500/20">
        <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-[0_0_10px_#3b82f6] flex justify-center items-center gap-2">
          🎓 <span>Subjects Management</span>
        </h1>

        <div className="flex justify-between mb-4">
          <button
            onClick={() => setModal({ open: true, initial: null })}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 hover:shadow-[0_0_15px_#3b82f6] hover:scale-105 transition-all duration-300"
          >
            ➕ Add Subject
          </button>
        </div>

        <table className="w-full border-collapse overflow-hidden rounded-xl">
          <thead>
            <tr className="bg-gradient-to-r from-blue-800 to-indigo-700 text-white">
              <th className="py-3 px-4 text-left">Subject Code</th>
              <th className="py-3 px-4 text-left">Subject Name</th>
              <th className="py-3 px-4 text-left">Instructor</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-700 hover:bg-gray-800 transition-all duration-300 text-gray-100"
                >
                  <td className="py-3 px-4">{s.subject_code}</td>
                  <td className="py-3 px-4">{s.subject_name}</td>
                  <td className="py-3 px-4">{s.instructor}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => setModal({ open: true, initial: s })}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 hover:shadow-[0_0_10px_#22c55e] hover:scale-105 transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteSubject(s.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 hover:shadow-[0_0_10px_#ef4444] hover:scale-105 transition-all"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-6 text-gray-400 text-center italic"
                >
                  No subjects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-[0_0_25px_#3b82f6] max-w-md w-full border border-gray-700 animate-fadeIn">
            <SubjectForm
              initial={modal.initial ?? {}}
              onSave={(payload) => saveSubject(payload, modal.initial?.id)}
              onCancel={() => setModal({ open: false })}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Subject Form Component
function SubjectForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    subject_code: "",
    subject_name: "",
    instructor: "",
    ...initial,
  });

  function change(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  return (
    <div className="space-y-3 text-left text-gray-100">
      <h2 className="text-xl font-semibold mb-3 text-blue-400">
        {initial?.id ? "Edit Subject" : "Add New Subject"}
      </h2>
      <input
        className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        name="subject_code"
        value={form.subject_code}
        onChange={change}
        placeholder="Subject Code (e.g., ITF101)"
      />
      <input
        className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        name="subject_name"
        value={form.subject_name}
        onChange={change}
        placeholder="Subject Name"
      />
      <input
        className="w-full bg-gray-800 border border-gray-600 px-3 py-2 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        name="instructor"
        value={form.instructor}
        onChange={change}
        placeholder="Instructor"
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onSave(form)}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 hover:shadow-[0_0_15px_#3b82f6] hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 hover:scale-105 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
