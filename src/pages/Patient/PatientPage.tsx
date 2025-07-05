import { useQuery } from '@tanstack/react-query';
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Pagination,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Button,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { getPatients } from '../../services/patientService';
import type { Patient } from '../../types';
import { Link } from 'react-router-dom';

const PatientPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  const specialties = useMemo(() => {
    const allSpecialties = patients
      .filter((p: Patient) => p?.specialty)
      .map((p: Patient) => p.specialty);
    return Array.from(new Set(allSpecialties)).sort();
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient: Patient) => {
      if (!patient || !patient.name) return false;

      const nameMatch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bedMatch = patient.bedNumber?.toString().includes(searchTerm);
      const specialtyMatch =
        specialtyFilter === '' || patient.specialty === specialtyFilter;

      return (nameMatch || bedMatch) && specialtyMatch;
    });
  }, [patients, searchTerm, specialtyFilter]);

  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredPatients.slice(start, start + rowsPerPage);
  }, [filteredPatients, page]);

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Erreur lors du chargement des patients.</Typography>;

  return (
    <Box>
      {/* Header + Filtres */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        mb={3}
        gap={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Patients hospitalisés
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            placeholder="Rechercher un patient..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
            sx={{ maxWidth: 400 }}
          />

          <Select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 200, borderRadius: 2 }}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 1, ml: 0.5 }}>
                <FilterIcon fontSize="small" color="action" />
              </InputAdornment>
            }
          >
            <MenuItem value="">Toutes spécialités</MenuItem>
            {specialties.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date d'admission</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Spécialité</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>N° de lit</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                          width: 40,
                          height: 40,
                          fontSize: 14,
                        }}
                      >
                        {patient.name
                          ? patient.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                          : '?'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>
                          {patient.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.age ? `${patient.age} ans` : 'Âge non renseigné'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{patient.admissionDate || 'Non renseignée'}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.specialty || 'Non définie'}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{patient.bedNumber ?? '—'}</TableCell>
                  <TableCell>


                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/patients/${patient.id}/medical-record`}
                    >
                      Dossier médical
                    </Button>

                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Aucun patient ne correspond à votre recherche
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Affichage de {filteredPatients.length} patients sur {patients.length} au total
        </Typography>
        <Pagination
          count={Math.ceil(filteredPatients.length / rowsPerPage)}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          shape="rounded"
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default PatientPage;
