import axios from './axios.customize';

const createUserApi = (name, email, password) =>
    axios.post("/v1/api/register", { name, email, password });

const verifyRegisterOTPApi = (email, otp) =>
    axios.post("/v1/api/verify-register", { email, otp });

const loginApi = (email, password) =>
    axios.post("/v1/api/login", { email, password });

const sendForgotPasswordOTPApi = (email) =>
    axios.post("/v1/api/forgot-password", { email });

const verifyForgotPasswordOTPApi = (email, otp, newPassword) =>
    axios.post("/v1/api/verify-forgot-password", { email, otp, newPassword });

const getUserApi = () =>
    axios.get("/v1/api/user");

const getUserProfileApi = () =>
    axios.get("/v1/api/user/profile");

const getAdminProfileApi = () =>
    axios.get("/v1/api/admin/profile");

const getProductsApi = (params) =>
    axios.get("/v1/api/products", { params });

const getProductDetailApi = (slug) =>
    axios.get(`/v1/api/products/${slug}`);

export {
    createUserApi,
    verifyRegisterOTPApi,
    loginApi,
    sendForgotPasswordOTPApi,
    verifyForgotPasswordOTPApi,
    getUserApi,
    getUserProfileApi,
    getAdminProfileApi,
    getProductsApi,
    getProductDetailApi,
};