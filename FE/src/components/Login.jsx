import React, { useState } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await AuthService.login(values.code, values.password);
      message.success('Đăng nhập thành công');
      navigate('/');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '100px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng nhập hệ thống THT</h2>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="code"
          rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
      
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button type="link" onClick={() => setShowRegister(true)}>
          Đăng ký tài khoản admin
        </Button>
      </div>
      
      {showRegister && (
        <Modal
          title="Đăng ký admin"
          open={showRegister}
          onCancel={() => setShowRegister(false)}
          footer={null}
          centered
        >
          <Form
            name="register"
            onFinish={async (values) => {
              try {
                setLoading(true);
                const response = await AuthService.register(values);
                message.success('Đăng ký thành công');
                setShowRegister(false);
              } catch (error) {
                message.error(error.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <Form.Item
              name="code"
              rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="username" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default Login;