import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Typography,
  Box
} from '@mui/material';
import { provinces, districts, wards } from '../../data/addressData';

const AddressSelect = ({ value, onChange, disabled = false }) => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  useEffect(() => {
    if (value) {
      // Parse địa chỉ từ server: "số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
      const parts = value.split(', ');
      
      // Tìm vị trí của Tỉnh/Thành phố (phần tử cuối cùng)
      const provinceName = parts[parts.length - 1];
      const province = provinces.find(p => p.name === provinceName);
      
      if (province) {
        setSelectedProvince(province.id);
        
        // Tìm vị trí của Quận/Huyện (phần tử kế cuối)
        const districtName = parts[parts.length - 2];
        const district = districts[province.id]?.find(d => d.name === districtName);
        
        if (district) {
          setSelectedDistrict(district.id);
          
          // Tìm vị trí của Phường/Xã (phần tử kế cuối thứ 2)
          const wardName = parts[parts.length - 3];
          const ward = wards[district.id]?.find(w => w.name === wardName);
          
          if (ward) {
            setSelectedWard(ward.id);
          }
          
          // Phần còn lại là số nhà và tên đường
          const streetParts = parts.slice(0, parts.length - 3);
          setStreetAddress(streetParts.join(', '));
        }
      }
    }
  }, [value]);

  const handleProvinceChange = (event) => {
    const provinceId = event.target.value;
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedWard('');
    updateAddress(provinceId, '', '', streetAddress);
  };

  const handleDistrictChange = (event) => {
    const districtId = event.target.value;
    setSelectedDistrict(districtId);
    setSelectedWard('');
    updateAddress(selectedProvince, districtId, '', streetAddress);
  };

  const handleWardChange = (event) => {
    const wardId = event.target.value;
    setSelectedWard(wardId);
    updateAddress(selectedProvince, selectedDistrict, wardId, streetAddress);
  };

  const handleStreetAddressChange = (event) => {
    const address = event.target.value;
    setStreetAddress(address);
    updateAddress(selectedProvince, selectedDistrict, selectedWard, address);
  };

  const updateAddress = (province, district, ward, street) => {
    const provinceName = provinces.find(p => p.id === province)?.name || '';
    const districtName = districts[province]?.find(d => d.id === district)?.name || '';
    const wardName = wards[district]?.find(w => w.id === ward)?.name || '';

    // Tạo địa chỉ theo định dạng: "số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
    const addressParts = [];
    
    // Thêm số nhà và tên đường nếu có
    if (street) {
      addressParts.push(street);
    }
    
    // Thêm Phường/Xã, Quận/Huyện, Tỉnh/Thành phố
    if (wardName) addressParts.push(wardName);
    if (districtName) addressParts.push(districtName);
    if (provinceName) addressParts.push(provinceName);

    // Kết hợp các phần thành địa chỉ hoàn chỉnh
    const address = addressParts.join(', ');
    onChange(address);
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Địa chỉ
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Số nhà, tên đường"
            value={streetAddress}
            onChange={handleStreetAddressChange}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Tỉnh/Thành phố</InputLabel>
            <Select
              value={selectedProvince}
              onChange={handleProvinceChange}
              label="Tỉnh/Thành phố"
              disabled={disabled}
            >
              {provinces.map((province) => (
                <MenuItem key={province.id} value={province.id}>
                  {province.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Quận/Huyện</InputLabel>
            <Select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              label="Quận/Huyện"
              disabled={disabled || !selectedProvince}
            >
              {districts[selectedProvince]?.map((district) => (
                <MenuItem key={district.id} value={district.id}>
                  {district.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Phường/Xã</InputLabel>
            <Select
              value={selectedWard}
              onChange={handleWardChange}
              label="Phường/Xã"
              disabled={disabled || !selectedDistrict}
            >
              {wards[selectedDistrict]?.map((ward) => (
                <MenuItem key={ward.id} value={ward.id}>
                  {ward.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressSelect; 