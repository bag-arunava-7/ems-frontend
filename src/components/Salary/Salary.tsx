import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Stepper,
  Button,
  Select,
  TextInput,
  Box,
  Group,
  Paper,
  Title,
  Container,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";

// ----------- Type Definitions -----------
type Company = {
  id: string;
  name: string;
  salaryTemplates: SalaryTemplate[];
};

type SalaryTemplate = {
  id: string;
  companyId: string;
  fields: {
    [key: string]: {
      value: string;
      enabled: boolean;
    };
  };
};

type Employee = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  name: string;
  designation: string;
  department: string;
  salary: number;
  joiningDate: string;
  leavingDate: string | null;
  [key: string]: any;
};

type CompanyOption = {
  value: string;
  label: string;
  salaryTemplates: SalaryTemplate[];
};

// ----------- Component Starts -----------
const SalaryPage: React.FC = () => {
  const [active, setActive] = useState<number>(0);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryTemplate, setSalaryTemplate] = useState<string[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [gridApi, setGridApi] = useState<any>(null);

  // ----------- Fetch Companies -----------
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get<{ data: { companies: Company[] } }>(
          "http://localhost:3003/companies"
        );
        const companyList = response.data?.data?.companies || [];
        setCompanies(
          companyList.map((company) => ({
            value: company.id,
            label: company.name,
            salaryTemplates: company.salaryTemplates || [],
          }))
        );
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  // ----------- Fetch Employees -----------
  const fetchEmployees = async (companyId: string) => {
    if (!companyId) return;
    try {
      const response = await axios.get<{ data: Employee[] }>(
        `http://localhost:3003/companies/${companyId}/employees`
      );
      const activeEmployees = response.data?.data?.filter(
        (emp) => !emp.leavingDate
      );
      setEmployees(
        activeEmployees.map((emp) => ({
          ...emp,
          name: `${emp.title ? emp.title + " " : ""}${emp.firstName} ${
            emp.lastName
          }`,
        }))
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // ----------- Handle Company Select -----------
  const handleCompanySelect = (company: CompanyOption | undefined) => {
    if (!company || typeof company !== "object") {
      console.warn("⚠️ Invalid or empty company data received:", company);
      setSelectedCompany("");
      setSalaryTemplate([]);
      setColumnDefs([]);
      setEmployees([]);
      return;
    }

    setSelectedCompany(company.value);
    console.log("✅ Company selected:", company);

    const templates = company.salaryTemplates || [];
    if (templates.length > 0) {
      const fields = templates[0].fields || {};
      const enabledFields = Object.keys(fields).filter(
        (key) => fields[key]?.enabled
      );
      setSalaryTemplate(enabledFields);

      const newColumnDefs = [
        { headerName: "Name", field: "name", filter: true, sortable: true },
        {
          headerName: "Designation",
          field: "designation",
          filter: true,
          sortable: true,
        },
        {
          headerName: "Department",
          field: "department",
          filter: true,
          sortable: true,
        },
        {
          headerName: "Salary",
          field: "salary",
          filter: "agNumberColumnFilter",
          sortable: true,
          editable: true,
          valueParser: (params: any) => {
            const newValue = Number(params.newValue);
            return isNaN(newValue) ? null : newValue;
          },
          valueFormatter: (params: any) =>
            params.value != null ? Number(params.value).toFixed(2) : "",
        },
        ...enabledFields.map((field) => ({
          headerName: field,
          field: field,
          editable: true,
          valueParser: (params: any) => {
            const newValue = Number(params.newValue);
            return isNaN(newValue) ? null : newValue;
          },
          valueFormatter: (params: any) =>
            params.value != null ? Number(params.value).toFixed(2) : "",
        })),
      ];
      setColumnDefs(newColumnDefs);
    } else {
      setSalaryTemplate([]);
      setColumnDefs([
        { headerName: "Name", field: "name", filter: true, sortable: true },
        {
          headerName: "Designation",
          field: "designation",
          filter: true,
          sortable: true,
        },
        {
          headerName: "Department",
          field: "department",
          filter: true,
          sortable: true,
        },
        {
          headerName: "Salary",
          field: "salary",
          filter: "agNumberColumnFilter",
          sortable: true,
          editable: true,
        },
      ]);
    }
  };

  // ----------- Step Controls -----------
  const nextStep = () => {
    if (active === 0 && !selectedCompany) {
      console.warn("Please select a company first!");
      return;
    }
    if (active === 1) {
      fetchEmployees(selectedCompany);
    }
    setActive((cur) => (cur < 2 ? cur + 1 : cur));
  };

  const prevStep = () => setActive((cur) => (cur > 0 ? cur - 1 : cur));

  // ----------- Grid Handlers -----------
  const onGridReady = (params: any) => setGridApi(params.api);

  const onCellValueChanged = useCallback((event: any) => {
    console.log("Cell value changed:", event);
  }, []);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      resizable: true,
    }),
    []
  );

  const onFilterTextBoxChanged = useCallback(() => {
    if (!gridApi) return;
    const input = document.getElementById(
      "filter-text-box"
    ) as HTMLInputElement | null;
    if (input) gridApi.setQuickFilter(input.value);
  }, [gridApi]);

  // ----------- Return UI -----------
  return (
    <Container size="xl" py="xl">
      <Paper shadow="sm" p="xl" withBorder>
        <Title order={2} mb="md">
          Salary Management
        </Title>

        <Stepper
          active={active}
          onStepClick={setActive}
          orientation="horizontal"
          mb="xl"
          allowNextStepsSelect={false}
        >
          {/* Step 1: Select Company */}
          <Stepper.Step label="Select Company" description="Choose a company">
            <Paper p="md" mt="md">
              <Select
                label="Select Company"
                data={
                  companies?.map((c) => ({ value: c.value, label: c.label })) ||
                  []
                }
                value={selectedCompany || null}
                onChange={(value) => {
                  const company = companies.find((c) => c.value === value);
                  handleCompanySelect(company);
                }}
                searchable
                clearable
                placeholder="Select a company..."
              />
            </Paper>
          </Stepper.Step>

          {/* Step 2: Select Month */}
          <Stepper.Step label="Select Month" description="Choose a month">
            <Paper p="md" mt="md">
              <MonthPickerInput
                valueFormat="MM-YYYY"
                label="Pick month"
                placeholder="Pick month"
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </Paper>
          </Stepper.Step>

          {/* Step 3: Salary Sheet */}
          <Stepper.Step
            label="Salary Sheet"
            description="View and edit salary sheet"
          >
            <Paper p="md" mt="md">
              <Box mb="md">
                <TextInput
                  id="filter-text-box"
                  leftSection={<IconSearch size={14} />}
                  placeholder="Search employees..."
                  onChange={onFilterTextBoxChanged}
                />
              </Box>
              <div
                className="ag-theme-alpine"
                style={{ height: 400, width: "100%" }}
              >
                <AgGridReact
                  columnDefs={columnDefs}
                  rowData={employees}
                  defaultColDef={defaultColDef}
                  onGridReady={onGridReady}
                  onCellValueChanged={onCellValueChanged}
                  enableCellChangeFlash={true}
                  animateRows={true}
                />
              </div>
            </Paper>
          </Stepper.Step>
        </Stepper>

        <Group mt="xl">
          {active !== 0 && (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          )}
          {active !== 2 && <Button onClick={nextStep}>Next step</Button>}
        </Group>
      </Paper>
    </Container>
  );
};

export default SalaryPage;
