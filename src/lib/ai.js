

/**
 * Save or update a student's grades in Supabase
 * @param {string} studentName
 * @param {Object} grades - { prelim, midterm, semifinal, final }
 */
export async function saveGradeToSupabase(studentName, grades) {
  try {
    // 1️⃣ Get student ID from students table
    const { data: student } = await supabase
      .from("students")
      .select("id, first_name, last_name")
      .ilike("first_name", `%${studentName.split(" ")[0]}%`)
      .maybeSingle();

    if (!student) {
      console.error("Student not found:", studentName);
      return;
    }

    // 2️⃣ Compute average & remark
    const values = Object.values(grades).map((n) => parseFloat(n) || 0);
    const average = values.reduce((a, b) => a + b, 0) / 4;
    const remark = average >= 3.0 ? "Failed" : "Passed";

    // 3️⃣ Check if record already exists
    const { data: existing } = await supabase
      .from("grades")
      .select("id")
      .eq("student_id", student.id)
      .maybeSingle();

    const gradeRecord = {
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      prelim: grades.prelim,
      midterm: grades.midterm,
      semifinal: grades.semifinal,
      final: grades.final,
      average: average.toFixed(2),
      remark,
    };

    // 4️⃣ Insert or Update
    if (existing) {
      await supabase.from("grades").update(gradeRecord).eq("id", existing.id);
    } else {
      await supabase.from("grades").insert([gradeRecord]);
    }

    console.log("✅ Grade saved for:", studentName);
  } catch (err) {
    console.error("❌ Error saving grade:", err.message);
  }
}
