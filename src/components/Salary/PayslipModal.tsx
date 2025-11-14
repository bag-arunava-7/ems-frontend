import React from "react";
import { Modal } from "@mantine/core";
import {
  Document,
  Page,
  View,
  Text as PDFText,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";

interface PayslipModalProps {
  opened: boolean;
  onClose: () => void;
  payslip: any | null;
  employees: any[];
  companies: any[];
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  opened,
  onClose,
  payslip,
  employees,
  companies,
}) => {

  // If nothing was passed
  if (!payslip) {
    return (
      <Modal opened={opened} onClose={onClose} size="90%" centered>
        <div>No Payslip Data</div>
      </Modal>
    );
  }

  // payslip itself contains salary values directly
  const s = payslip;

  // find employee and company details
  const employee = employees.find((e) => e.employeeId === payslip.employeeId);
  const company = companies.find((c) => c.id === payslip.companyId);

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) amount = 0;
    return `₹ ${amount.toFixed(2)}`;
  };

  const PayslipPDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src="logo512.png" style={styles.logo} />
          </View>

          <View style={styles.companyInfo}>
            <PDFText style={styles.companyName}>{company?.name}</PDFText>
            <PDFText style={styles.companyAddress}>
              Official Payslip – {payslip.month}
            </PDFText>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.employeeInfo}>
          <View style={styles.infoColumn}>
            <PDFText style={styles.label}>Employee Name:</PDFText>
            <PDFText style={styles.value}>
              {employee?.firstName} {employee?.lastName}
            </PDFText>

            <PDFText style={styles.label}>Employee ID:</PDFText>
            <PDFText style={styles.value}>{employee?.employeeId}</PDFText>
          </View>

          <View style={styles.infoColumn}>
            <PDFText style={styles.label}>Designation:</PDFText>
            <PDFText style={styles.value}>
              {employee?.designation ?? employee?.employmentHistories?.[0]?.designationName}
            </PDFText>

            <PDFText style={styles.label}>Present Days:</PDFText>
            <PDFText style={styles.value}>{s.presentDays ?? 0}</PDFText>
          </View>
        </View>

        {/* Salary Breakdown */}
        <View style={styles.salaryDetails}>
          <View style={styles.column}>
            <PDFText style={styles.sectionTitle}>Earnings</PDFText>

            <View style={styles.row}>
              <PDFText style={styles.label}>Basic Pay</PDFText>
              <PDFText style={styles.value}>{formatCurrency(s.basicPay)}</PDFText>
            </View>

            <View style={styles.row}>
              <PDFText style={styles.label}>Gross Salary</PDFText>
              <PDFText style={styles.value}>{formatCurrency(s.grossSalary)}</PDFText>
            </View>
          </View>

          {/* Deductions */}
          <View style={styles.column}>
            <PDFText style={styles.sectionTitle}>Deductions</PDFText>

            <View style={styles.row}>
              <PDFText style={styles.label}>PF</PDFText>
              <PDFText style={styles.value}>{formatCurrency(s.pf)}</PDFText>
            </View>

            <View style={styles.row}>
              <PDFText style={styles.label}>ESIC</PDFText>
              <PDFText style={styles.value}>{formatCurrency(s.esic)}</PDFText>
            </View>

            <View style={styles.row}>
              <PDFText style={styles.label}>LWF</PDFText>
              <PDFText style={styles.value}>{formatCurrency(s.lwf)}</PDFText>
            </View>

            <View style={styles.row}>
              <PDFText style={styles.label}>Total Deductions</PDFText>
              <PDFText style={styles.value}>
                {formatCurrency(s.totalDeductions)}
              </PDFText>
            </View>
          </View>
        </View>

        {/* Net Salary */}
        <View style={styles.netSalary}>
          <PDFText style={styles.netSalaryLabel}>Net Salary</PDFText>
          <PDFText style={styles.netSalaryValue}>
            {formatCurrency(s.netSalary)}
          </PDFText>
        </View>

        <View style={styles.footer}>
          <PDFText style={styles.footerText}>
            This is a computer-generated payslip.
          </PDFText>
        </View>

      </Page>
    </Document>
  );

  return (
    <Modal opened={opened} onClose={onClose} size="90%" centered>
      <PDFViewer width="100%" height={700}>
        <PayslipPDF />
      </PDFViewer>
    </Modal>
  );
};

// ============================ Styles =============================

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { flexDirection: "row", marginBottom: 20 },

  logoContainer: { width: 80, height: 40, marginRight: 20 },
  logo: { width: "100%", height: "100%" },

  companyInfo: { flex: 1 },
  companyName: { fontSize: 18, fontWeight: "bold" },
  companyAddress: { fontSize: 10, color: "#777" },

  employeeInfo: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
  infoColumn: { flex: 1 },

  label: { fontSize: 10, color: "#555" },
  value: { fontSize: 12, marginBottom: 6 },

  salaryDetails: { flexDirection: "row", marginBottom: 20 },
  column: { flex: 1, marginRight: 10 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#888",
  },

  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },

  netSalary: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  netSalaryLabel: { color: "white", fontSize: 16, fontWeight: "bold" },
  netSalaryValue: { color: "white", fontSize: 18, fontWeight: "bold" },

  footer: { textAlign: "center", marginTop: 20 },
  footerText: { fontSize: 8, color: "#666" },
});
