import React, { useState } from "react";
import { Container, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CompanyForm from "./CompanyForm";
import type { CompanyFormValues } from "./CompanyForm";

const AddCompany: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: CompanyFormValues) => {
    setIsLoading(true);
    try {
      // ✅ Format date from DD/MM/YYYY or Date to DD-MM-YYYY string
      const formatDate = (date: any) => {
        if (!date) return null;
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };

      // ✅ Build salaryTemplates exactly as backend expects
      const salaryTemplates = {
        mandatoryFields: [
          {
            key: "serialNumber",
            label: "S.No",
            type: "NUMBER",
            category: "MANDATORY_NO_RULES",
            purpose: "INFORMATION",
            enabled: true,
          },
          {
            key: "companyName",
            label: "Company Name",
            type: "TEXT",
            category: "MANDATORY_NO_RULES",
            purpose: "INFORMATION",
            enabled: true,
          },
          {
            key: "employeeName",
            label: "Employee Name",
            type: "TEXT",
            category: "MANDATORY_NO_RULES",
            purpose: "INFORMATION",
            enabled: true,
          },
          {
            key: "designation",
            label: "Designation",
            type: "TEXT",
            category: "MANDATORY_NO_RULES",
            purpose: "INFORMATION",
            enabled: true,
          },
          {
            key: "monthlyPay",
            label: "Monthly Pay",
            type: "NUMBER",
            category: "MANDATORY_NO_RULES",
            purpose: "CALCULATION",
            enabled: true,
          },
          {
            key: "grossSalary",
            label: "Gross Salary",
            type: "NUMBER",
            category: "MANDATORY_NO_RULES",
            purpose: "CALCULATION",
            enabled: true,
          },
          {
            key: "totalDeduction",
            label: "Total Deduction",
            type: "NUMBER",
            category: "MANDATORY_NO_RULES",
            purpose: "CALCULATION",
            enabled: true,
          },
          {
            key: "netSalary",
            label: "Net Salary",
            type: "NUMBER",
            category: "MANDATORY_NO_RULES",
            purpose: "CALCULATION",
            enabled: true,
          },
        ],
        optionalFields: [
          {
            key: "pf",
            label: "PF (12%)",
            type: "NUMBER",
            category: "OPTIONAL_NO_RULES",
            purpose: "DEDUCTION",
            enabled: true,
          },
          {
            key: "esic",
            label: "ESIC (0.75%)",
            type: "NUMBER",
            category: "OPTIONAL_NO_RULES",
            purpose: "DEDUCTION",
            enabled: true,
          },
          {
            key: "fatherName",
            label: "Father Name",
            type: "TEXT",
            category: "OPTIONAL_NO_RULES",
            purpose: "INFORMATION",
            enabled: true,
          },
          {
            key: "uanNumber",
            label: "UAN No.",
            type: "TEXT",
            category: "OPTIONAL_NO_RULES",
            purpose: "INFORMATION",
            enabled: true,
          },
        ],
        customFields: [],
      };

      const payload = {
        name: values.name.trim().toUpperCase(),
        address: values.address.trim().toUpperCase(),
        contactPersonName: values.contactPersonName.trim().toUpperCase(),
        contactPersonNumber: values.contactPersonNumber,
        status: values.status,
        companyOnboardingDate: formatDate(values.companyOnboardingDate),
        salaryTemplates,
      };

      console.log("📦 Sending payload:", payload);

      const response = await axios.post("http://localhost:3003/companies", payload);
      console.log("✅ Response:", response.data);

      alert("✅ Company added successfully!");
      navigate("/companies");
    } catch (error: any) {
      console.error("❌ Error creating company:", error.response?.data || error);
      alert(`❌ Failed to create company: ${error.response?.data?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="lg">
      <Title order={1} mb="xl">
        Add New Company
      </Title>
      <CompanyForm onSubmit={handleSubmit} isLoading={isLoading} />
    </Container>
  );
};

export default AddCompany;
