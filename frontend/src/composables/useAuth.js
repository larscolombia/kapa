import { ref } from 'vue';
import { login } from 'src/services/authService';
import { forgotPassword, restorePassword, changePassword } from 'src/services/userService';
import { useAuthStore } from 'src/stores/auth';
import { LocalStorage } from 'quasar';
import { useRouter } from 'vue-router';

export const useAuth = () => {
    const authStore = useAuthStore();
    const error = ref(null);
    const router = useRouter();
    const loginUser = async (credentials) => {
        try {
            if (!credentials.email || !credentials.password) throw new Error('No ha ingresado usuario o contraseña');
            const loginData = await login(credentials);
            LocalStorage.setItem('authToken', loginData.accessToken);
            await authStore.validateUser();
        } catch (err) {
            error.value = err.message;
        }
    };

    const logoutUser = async () => {
        LocalStorage.removeItem('authToken');
        await authStore.validateUser();
        router.push('/login');
    };

    const forgotUserPassword = async (email) => {
        try {
            const forgotPasswordData = await forgotPassword(email);
            return forgotPasswordData.message;
        } catch (err) {
            error.value = err.message;
        }
    };

    const restoreUserPassword = async (newPasswordObject) => {
        try {
            const restorePasswordData = await restorePassword(newPasswordObject);
            return restorePasswordData.message;
        } catch (err) {
            error.value = err.message;
        }
    };

    const changeUserPassword = async (newPasswordObject) => {
        try {
            const changePasswordData = await changePassword(newPasswordObject);
            return changePasswordData.message;
        } catch (err) {
            error.value = err.message;
        }
    };

    return {
        loginUser,
        forgotUserPassword,
        logoutUser,
        restoreUserPassword,
        changeUserPassword,
        error,
    };
};
