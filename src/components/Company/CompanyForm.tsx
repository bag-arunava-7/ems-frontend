import React from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  NumberInput,
  Select,
  Checkbox,
  Button,
  Paper,
  Title,
  Grid,
  Stack,
  Group,
  Divider,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  convertToCustomDateFormat,
  parseDateString,
} from '../utils/date.converter';

interface SalaryTemplateField {
  enabled: boolean;
  value: string;
}

export interface CompanyFormValues {
  name: string;
  address: string;
  contactPersonName: string;
  contactPersonNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  companyOnboardingDate: Date | null; // ⭐ FIXED → Date in UI
  salaryTemplates: Record<string, SalaryTemplateField>;
}

interface CompanyFormProps {
  initialValues?: CompanyFormValues;
  onSubmit: (values: any) => void | Promise<void>;
  isLoading?: boolean;
}

const salaryTemplateFields = [
  { id: 'basicPay', label: 'Basic Pay' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'pf', label: 'PF 12%' },
  { id: 'esic', label: 'ESIC 0.75%' },
  { id: 'netSalary', label: 'Net Salary' },
];

const buildSafeSalaryTemplate = (input?: Record<string, SalaryTemplateField>) => {
  return Object.fromEntries(
    salaryTemplateFields.map((f) => [
      f.id,
      input?.[f.id] ?? { enabled: true, value: '' },
    ])
  );
};

const CompanyForm: React.FC<CompanyFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<CompanyFormValues>({
    initialValues: {
      name: initialValues?.name || '',
      address: initialValues?.address || '',
      contactPersonName: initialValues?.contactPersonName || '',
      contactPersonNumber: initialValues?.contactPersonNumber || '',
      status: initialValues?.status || 'ACTIVE',

      // ⭐ FIX: Convert stored string to Date when loading
      companyOnboardingDate: initialValues?.companyOnboardingDate
        ? parseDateString(initialValues.companyOnboardingDate as any)
        : null,

      salaryTemplates: buildSafeSalaryTemplate(initialValues?.salaryTemplates),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    const formatted = {
      ...values,

      // ⭐ FIX: Convert Date → dd-mm-yyyy before sending to backend
      companyOnboardingDate: values.companyOnboardingDate
        ? convertToCustomDateFormat(values.companyOnboardingDate)
        : null,

      salaryTemplates: buildSafeSalaryTemplate(values.salaryTemplates),
    };

    onSubmit(formatted);
  });

  return (
    <Paper shadow="sm" p="xl" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          <Title order={2}>{initialValues ? 'Edit Company' : 'Add Company'}</Title>

          <Grid>
            <Grid.Col span={6}>
              <TextInput label="Company Name" required {...form.getInputProps('name')} />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput label="Address" required {...form.getInputProps('address')} />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Contact Person Name"
                required
                {...form.getInputProps('contactPersonName')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Contact Person Number"
                required
                {...form.getInputProps('contactPersonNumber')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Status"
                required
                data={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
                {...form.getInputProps('status')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <DateInput
                label="Company Onboarding Date"
                required
                value={form.values.companyOnboardingDate}
                onChange={(d) => form.setFieldValue('companyOnboardingDate', d)}
              />
            </Grid.Col>
          </Grid>

          <Divider my="lg" />

          <Title order={3}>Salary Template</Title>

          <Grid>
            {salaryTemplateFields.map((f) => (
              <Grid.Col key={f.id} span={6}>
                <Group align="center">
                  <Checkbox
                    {...form.getInputProps(`salaryTemplates.${f.id}.enabled`, {
                      type: 'checkbox',
                    })}
                  />

                  <NumberInput
                    label={f.label}
                    {...form.getInputProps(`salaryTemplates.${f.id}.value`)}
                    disabled={!form.values.salaryTemplates[f.id].enabled}
                    style={{ flex: 1 }}
                  />
                </Group>
              </Grid.Col>
            ))}
          </Grid>

          <Group mt="xl">
            <Button type="submit" loading={isLoading}>
              {initialValues ? 'Update Company' : 'Add Company'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default CompanyForm;
