import * as yup from 'yup';

export const projectSchema = yup.object().shape({
  code: yup.string()
    .required('Mã dự án không được để trống')
    .min(3, 'Mã dự án phải có ít nhất 3 ký tự')
    .max(50, 'Mã dự án không được vượt quá 50 ký tự'),
  name: yup.string()
    .required('Tên dự án không được để trống')
    .min(3, 'Tên dự án phải có ít nhất 3 ký tự')
    .max(255, 'Tên dự án không được vượt quá 255 ký tự'),
  description: yup.string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  startDate: yup.date()
    .required('Ngày bắt đầu không được để trống')
    .nullable(),
  endDate: yup.date()
    .required('Ngày kết thúc không được để trống')
    .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
    .nullable(),
  managerId: yup.number()
    .required('Người quản lý không được để trống')
    .typeError('Người quản lý không được để trống'),
  departmentId: yup.number()
    .required('Phòng ban không được để trống')
    .typeError('Phòng ban không được để trống'),
  projectTypeId: yup.number()
    .required('Loại dự án không được để trống')
    .typeError('Loại dự án không được để trống')
});

export const taskSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên công việc là bắt buộc')
    .min(5, 'Tên công việc phải có ít nhất 5 ký tự'),
  
  assignee: yup
    .string()
    .required('Người thực hiện là bắt buộc'),
  
  startDate: yup
    .date()
    .required('Ngày bắt đầu là bắt buộc'),
  
  endDate: yup
    .date()
    .required('Ngày kết thúc là bắt buộc')
    .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  
  priority: yup
    .string()
    .required('Độ ưu tiên là bắt buộc')
    .oneOf(['HIGH', 'MEDIUM', 'LOW'], 'Độ ưu tiên không hợp lệ'),
  
  status: yup
    .string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 'Trạng thái không hợp lệ')
});

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const getEmailError = (email) => {
  if (!email) return 'Email không được để trống';
  if (!validateEmail(email)) return 'Email không đúng định dạng';
  return '';
};

export const getPhoneError = (phone) => {
  if (!phone) return 'Số điện thoại không được để trống';
  if (!validatePhone(phone)) return 'Số điện thoại phải có 10 chữ số';
  return '';
}; 