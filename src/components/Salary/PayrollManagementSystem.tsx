import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation } from "react-query";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import {
  IconCalculator,
  IconSearch,
  IconFileText,
  IconFileSpreadsheet,
  IconDownload,
} from "@tabler/icons-react";
import {
  Select,
  Table,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Group,
  Card,
  Text,
  Loader,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { CSVLink } from "react-csv";
import { PayslipModal } from "./PayslipModal";

const API_BASE_URL = "http://localhost:3003";

// GET COMPANIES
const fetchCompanies = async () => {
  const response = await axios.get(`${API_BASE_URL}/companies`);
  return response.data.data.companies;
};

// GET EMPLOYEES OF COMPANY
const fetchEmployees = async ({ queryKey }: any) => {
  const [_, companyId] = queryKey;
  if (!companyId) return [];
  const response = await axios.get(
    `${API_BASE_URL}/companies/${companyId}/employees`
  );
  return response.data.data || [];
};

// CALCULATE PAYROLL — FIXED FOR SIMPLE OPTION A
const calculateSalary = async (data: {
  companyId: string;
  month: string;
  employeeId: string;
  advanceTaken: number;
  bonus: number;
}) => {
  const response = await axios.post(
    `${API_BASE_URL}/payroll/calculate-payroll`,
    {
      companyId: data.companyId,
      payrollMonth: data.month,
      adminInputs: {
        [data.employeeId]: {
          advanceTaken: data.advanceTaken,
          bonus: data.bonus,
        },
      },
    }
  );

  return response.data.data;
};

const PayrollManagementSystem: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [calculatedSalaries, setCalculatedSalaries] = useState<
    Record<string, any>
  >({});
  const [calculationModalOpen, setCalculationModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPayslip, setCurrentPayslip] = useState<any | null>(null);

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery(
    ["companies"],
    fetchCompanies
  );

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery(
    ["employees", selectedCompany],
    fetchEmployees,
    { enabled: !!selectedCompany }
  );

  // Simple Form: Only Advance + Bonus
  const form = useForm({
    initialValues: {
      advanceTaken: 0,
      bonus: 0,
    },
  });

  const calculateSalaryMutation = useMutation(calculateSalary, {
    onSuccess: (data) => {
      try {
        const results = data?.payrollResults || [];

        if (!Array.isArray(results) || results.length === 0) {
          notifications.show({
            title: "No results",
            message: "Backend returned no payroll results.",
            color: "yellow",
          });
          return;
        }

        const result = results[0];
        const employeeId = result.employeeId ?? currentEmployee?.employeeId;
        const salary = result.salary ?? result;

        if (employeeId) {
          setCalculatedSalaries((prev) => ({
            ...prev,
            [employeeId]: salary,
          }));
        }

        setCurrentPayslip({
          ...salary,
          employeeId,
          companyId: selectedCompany,
          month: dayjs(selectedMonth).format("YYYY-MM"),
        });

        setPdfModalOpen(true);
        notifications.show({
          title: "Success",
          message: "Salary calculated successfully",
          color: "green",
        });

        setCalculationModalOpen(false);
      } catch (e) {
        notifications.show({
          title: "Error",
          message: "Unexpected response from backend",
          color: "red",
        });
      }
    },

    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to calculate salary.";
      notifications.show({
        title: "Error",
        message: msg,
        color: "red",
      });
    },
  });

  const handleCalculateSalary = (employee: any) => {
    setCurrentEmployee(employee);
    form.setValues({ advanceTaken: 0, bonus: 0 });
    setCalculationModalOpen(true);
  };

  const handleSalaryCalculation = (values: any) => {
    if (!selectedCompany || !selectedMonth || !currentEmployee) {
      notifications.show({
        title: "Error",
        message: "Please select company, month & employee.",
        color: "red",
      });
      return;
    }

    const formattedMonth = dayjs(selectedMonth).format("YYYY-MM");

    calculateSalaryMutation.mutate({
      companyId: selectedCompany,
      month: formattedMonth,
      employeeId: currentEmployee.employeeId,
      ...values,
    });
  };

  const filteredEmployees = Array.isArray(employees)
    ? employees.filter((employee: any) =>
        `${employee.firstName ?? ""} ${employee.lastName ?? ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  const rows = filteredEmployees.map((employee: any) => (
    <Table.Tr key={employee.employeeId}>
      <Table.Td>{employee.employeeId}</Table.Td>
      <Table.Td>{employee.firstName}</Table.Td>
      <Table.Td>{employee.lastName}</Table.Td>
      <Table.Td>{employee.designation}</Table.Td>

      <Table.Td>
        {employee.salary
          ? `₹${Number(employee.salary).toFixed(2)}`
          : "-"}
      </Table.Td>

      <Table.Td>
        {calculatedSalaries[employee.employeeId]?.netSalary
          ? `₹${Number(
              calculatedSalaries[employee.employeeId].netSalary
            ).toFixed(2)}`
          : "-"}
      </Table.Td>

      <Table.Td>
        <Group justify="left">
          <Tooltip label="Calculate Salary">
            <ActionIcon
              color="blue"
              onClick={() => handleCalculateSalary(employee)}
              disabled={!selectedMonth}
            >
              <IconCalculator size={18} />
            </ActionIcon>
          </Tooltip>

          {calculatedSalaries[employee.employeeId] && (
            <>
              <Tooltip label="View Payslip">
                <ActionIcon
                  color="green"
                  onClick={() => {
                    setCurrentPayslip({
                      ...calculatedSalaries[employee.employeeId],
                      employeeId: employee.employeeId,
                      companyId: selectedCompany,
                      month: dayjs(selectedMonth).format("YYYY-MM"),
                    });
                    setPdfModalOpen(true);
                  }}
                >
                  <IconFileText size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Download CSV">
                <CSVLink
                  data={[
                    {
                      ID: employee.employeeId,
                      Name: `${employee.firstName} ${employee.lastName}`,
                      NetSalary:
                        calculatedSalaries[employee.employeeId]?.netSalary ??
                        0,
                    },
                  ]}
                  filename={`${employee.firstName}_${employee.lastName}_salary.csv`}
                >
                  <ActionIcon color="orange">
                    <IconFileSpreadsheet size={18} />
                  </ActionIcon>
                </CSVLink>
              </Tooltip>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Text fw={500} size="lg">
              Payroll Management System
            </Text>
          </Group>
        </Card.Section>

        <Card.Section withBorder inheritPadding py="xs">
          <Group grow>
            <Select
              label="Select Company"
              placeholder="Choose company"
              data={companies.map((c: any) => ({
                value: c.id,
                label: c.name,
              }))}
              value={selectedCompany}
              onChange={setSelectedCompany}
              searchable
              clearable
              disabled={isLoadingCompanies}
            />

            <MonthPickerInput
              valueFormat="MM-YYYY"
              placeholder="Pick month"
              label="Pick month"
              value={selectedMonth}
              onChange={setSelectedMonth}
            />
          </Group>
        </Card.Section>

        <Card.Section withBorder inheritPadding py="xs">
          <TextInput
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            leftSection={<IconSearch size={14} />}
          />
        </Card.Section>

        <Card.Section>
          {isLoadingEmployees ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Employee ID</Table.Th>
                    <Table.Th>First Name</Table.Th>
                    <Table.Th>Last Name</Table.Th>
                    <Table.Th>Designation</Table.Th>
                    <Table.Th>Base Salary</Table.Th>
                    <Table.Th>Calculated</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>{rows}</Table.Tbody>
              </Table>

              {filteredEmployees.length > 0 && (
                <Group justify="flex-end" mt="md">
                  <CSVLink
                    data={filteredEmployees.map((e: any) => ({
                      ID: e.employeeId,
                      Name: `${e.firstName} ${e.lastName}`,
                      Salary: e.salary,
                    }))}
                    filename="all_employees.csv"
                  >
                    <Button leftSection={<IconDownload size={14} />}>
                      Download All
                    </Button>
                  </CSVLink>
                </Group>
              )}
            </>
          )}
        </Card.Section>
      </Card>

      {/* Salary Calculation Modal */}
      <Modal
        opened={calculationModalOpen}
        onClose={() => setCalculationModalOpen(false)}
        title={`Calculate Salary for ${
          currentEmployee?.firstName ?? ""
        } ${currentEmployee?.lastName ?? ""}`}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSalaryCalculation)}>
          <Group grow>
            <NumberInput
              label="Advance Taken"
              {...form.getInputProps("advanceTaken")}
              min={0}
            />

            <NumberInput
              label="Bonus"
              {...form.getInputProps("bonus")}
              min={0}
            />
          </Group>

          <Group justify="flex-end" mt="xl">
            <Button
              variant="outline"
              onClick={() => setCalculationModalOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" loading={calculateSalaryMutation.isLoading}>
              Calculate
            </Button>
          </Group>
        </form>
      </Modal>

      <PayslipModal
        opened={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        payslip={currentPayslip}
        employees={employees}
        companies={companies}
      />
    </div>
  );
};

export default PayrollManagementSystem;
