import React from 'react';
import Row1 from './Row1';
import Row3 from './Row3';
import Button from '@mui/material/Button';
import { DownloadOutlined } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

const Dashboard = () => {
  const handleDownloadReport = () => {
    const row1Data = [
      { title: 'Appointments Scheduled (Egypt)', value: '2,500', increase: '+10%' },
      { title: 'New Admissions (Egypt)', value: '600', increase: '+12%' },
      { title: 'Active Staff (Egypt)', value: '450', increase: '+5%' },
      { title: 'Tests Conducted (Egypt)', value: '1,200', increase: '+15%' },
    ];

    const row3Data = [
      { title: 'Patient Distribution (Cairo)', value: '120 Patients' },
      { title: 'Staff Activity (Egypt)', value: 'N/A' },
      { title: 'Regional Coverage (Egypt)', value: 'Greater Cairo, Alexandria' },
    ];

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Report: Egypt Medical Admin Dashboard Summary\n';
    csvContent += `Generated on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })}\n\n`;

    csvContent += 'Metric,Value,Increase\n';
    row1Data.forEach((item) => {
      csvContent += `${item.title},${item.value},${item.increase}\n`;
    });
    csvContent += '\n';

    csvContent += 'Distribution/Activity,Value\n';
    row3Data.forEach((item) => {
      csvContent += `${item.title},${item.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PhysioCare_Medical_Admin_Dashboard_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ m: 0, p: 0 }}> {/* Remove margins/padding */}
      <Box mb={2}>
        <Typography
          sx={{
            color: '#4fc3f7',
            fontWeight: 'bold',
          }}
          variant="h5"
        >
        Admin Dashboard
        </Typography>
        <Typography variant="body1">Managing PhysioCare App</Typography>
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box />
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadOutlined />}
          onClick={handleDownloadReport}
        >
          Download Report
        </Button>
      </Stack>
      <Row1 />
      <Row3 />
    </Box>
  );
};

export default Dashboard;