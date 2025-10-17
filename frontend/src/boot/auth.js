import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'src/stores/auth';

export default boot(async ({ store }) => {
    const authStore = useAuthStore();
    if (localStorage.getItem('authToken')) {
        try {
            console.log('Loading user profile...');
            await authStore.validateUser();
        } catch (error) {
            console.error('Error loading user profile:', error);
            authStore.logout(); // Si hay un error, limpia el estado
        }
    }
});
