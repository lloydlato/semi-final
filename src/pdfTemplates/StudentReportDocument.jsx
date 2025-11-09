// src/pdfTemplates/StudentReportDocument.jsx
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  header: { fontSize: 20, textAlign: "center", marginBottom: 20 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1 },
  row: { flexDirection: "row" },
  cell: { borderWidth: 1, padding: 4, flexGrow: 1, textAlign: "center" },
});

export default function StudentReportDocument({ subject, grades }) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>📘 {subject} - Student Grades Report</Text>

        <View style={styles.table}>
          <View style={[styles.row, { backgroundColor: "#e0e0e0" }]}>
            <Text style={styles.cell}>Student</Text>
            <Text style={styles.cell}>Prelim</Text>
            <Text style={styles.cell}>Midterm</Text>
            <Text style={styles.cell}>Semifinal</Text>
            <Text style={styles.cell}>Final</Text>
            <Text style={styles.cell}>Average</Text>
            <Text style={styles.cell}>Remark</Text>
          </View>

          {grades.map((g) => (
            <View style={styles.row} key={g.name}>
              <Text style={styles.cell}>{g.name}</Text>
              <Text style={styles.cell}>{g.prelim}</Text>
              <Text style={styles.cell}>{g.midterm}</Text>
              <Text style={styles.cell}>{g.semifinal}</Text>
              <Text style={styles.cell}>{g.final}</Text>
              <Text style={styles.cell}>
                {(
                  (parseFloat(g.prelim) +
                    parseFloat(g.midterm) +
                    parseFloat(g.semifinal) +
                    parseFloat(g.final)) /
                  4
                ).toFixed(2)}
              </Text>
              <Text style={styles.cell}>{g.remark}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
