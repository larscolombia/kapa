import { defineStore } from 'pinia';
import { getProfile, getPermissions } from 'src/services/authService';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        user: null,
        permissions: [],
    }),
    actions: {
        async validateUser() {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) { this.logoutUser(); return; }
                const user = await getProfile();
                await this.loginUser(user);
            } catch (error) {
                this.logoutUser();
            }
        },
        async loginUser(user) {
            this.user = user;
            const rolePermissions = await getPermissions();
            this.setPermissions(rolePermissions);
            this.isAuthenticated = true;
        },
        logoutUser() {
            this.user = null;
            this.permissions = [];
            this.isAuthenticated = false;
        },
        setPermissions(rolePermissions) {
            this.permissions = rolePermissions.permissions;
        },
        hasPermission(moduleName, action) {
            const module = this.permissions.find(permission => permission.module_name === moduleName);
            if (module) {
                return module[action];
            }
            return false;
        }
    },
});
