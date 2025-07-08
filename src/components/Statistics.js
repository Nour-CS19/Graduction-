import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import { Box, Typography, Grid, Container, Paper } from '@mui/material';
import doctorImage from '../assets/images/doctor-9335699_1280.png';

const Statistics = ({ stats }) => {
  return (
    <Grid container spacing={4} justifyContent="center">
      {stats.map((stat, index) => (
        <Grid key={index} item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { 
                transform: 'translateY(-8px)', 
                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
              },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box 
              sx={{ 
                mb: 3,
                borderRadius: '50%',
                backgroundColor: 'rgba(58, 134, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                overflow: 'hidden'
              }}
            >
              <img 
                src={doctorImage} 
                alt={stat.alt || 'Statistic icon'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
              />
            </Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1, 
                color: '#212529',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              <CountUp end={stat.count} duration={2.5} separator="," />
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#6c757d',
                fontWeight: 500,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              {stat.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

const SearchAndStatisticsSection = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackStats = [
    { count: 5, label: 'Patients', alt: 'Patient icon' },
    { count: 7, label: 'Doctors', alt: 'Doctor icon' },
    { count: 9, label: 'Laboaratoris', alt: 'Specialist icon' },
    { count: 4, label: 'Nurses', alt: 'Caregiver icon' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setStats(fallbackStats);
          setLoading(false);
          return;
        }

        const response = await axios.get('https://physiocareapp.runasp.net/api/v1/Statistics', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.data && Array.isArray(response.data)) {
          setStats(response.data);
        } else {
          setStats(fallbackStats);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading statistics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      sx={{
        py: 10,
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      }}
    >
      <Container>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            mb: 7, 
            color: '#212529',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 4,
              backgroundColor: '#3a86ff',
              borderRadius: 2
            }
          }}
        >
          Our PhysioCare Community
        </Typography>

        <Statistics stats={stats} />

        {error && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchAndStatisticsSection;
